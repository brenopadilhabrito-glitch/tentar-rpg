const canvas = document.querySelector("#world-canvas");
const context = canvas.getContext("2d");
const positionLabel = document.querySelector("#position");
const interactionHint = document.querySelector("#interaction-hint");
const biomeLabel = document.querySelector("#biome-label");
const panel = document.querySelector("#game-panel");
const panelTitle = document.querySelector("#panel-title");
const panelContent = document.querySelector("#panel-content");
const toast = document.querySelector("#toast");

const tileSize = 48;
const playerSize = 22;
const safeSpawnRadius = 280;
const keys = new Set();
const joystickAxes = { x: 0, y: 0 };
const moveJoystick = document.querySelector("#move-joystick");
const joystickKnob = document.querySelector("#joystick-knob");
let joystickPointerId = null;
const touchLayout = window.matchMedia("(pointer: coarse), (max-width: 600px)");
const directions = {
	w: "up", ArrowUp: "up", a: "left", ArrowLeft: "left",
	s: "down", ArrowDown: "down", d: "right", ArrowRight: "right",
};

const items = {
	wood_sword: { name: "Espada de freixo", type: "Arma", slot: "weapon", classes: ["warrior"], damage: 5, cost: 0, rarity: "Comum" },
	iron_sword: { name: "Lâmina de ferro", type: "Arma", slot: "weapon", classes: ["warrior"], damage: 12, cost: 105, rarity: "Incomum" },
	guardian_sword: { name: "Lâmina do guardião", type: "Arma", slot: "weapon", classes: ["warrior"], damage: 17, cost: 0, rarity: "Épico" },
	apprentice_staff: { name: "Cajado de aprendiz", type: "Arma", slot: "weapon", classes: ["mage"], damage: 3, magic: 8, cost: 0, rarity: "Comum" },
	oak_staff: { name: "Cajado de carvalho", type: "Arma", slot: "weapon", classes: ["mage"], damage: 7, magic: 12, cost: 115, rarity: "Incomum" },
	priest_staff: { name: "Bastão da aurora", type: "Arma", slot: "weapon", classes: ["healer"], damage: 3, magic: 8, cost: 0, rarity: "Comum" },
	sanctuary_staff: { name: "Báculo do santuário", type: "Arma", slot: "weapon", classes: ["healer"], damage: 6, magic: 15, cost: 125, rarity: "Raro" },
	hunting_bow: { name: "Arco de caça", type: "Arma", slot: "weapon", classes: ["archer"], damage: 6, cost: 0, rarity: "Comum" },
	longbow: { name: "Arco de teixo", type: "Arma", slot: "weapon", classes: ["archer"], damage: 15, cost: 120, rarity: "Raro" },
	tower_shield: { name: "Escudo de carvalho", type: "Escudo", slot: "shield", classes: ["tank"], damage: 3, defense: 8, cost: 0, rarity: "Comum" },
	guardian_shield: { name: "Égide do guardião", type: "Escudo", slot: "shield", classes: ["tank"], damage: 8, defense: 15, cost: 130, rarity: "Raro" },
	rogue_dagger: { name: "Adaga de batedora", type: "Arma", slot: "weapon", classes: ["rogue"], damage: 7, cost: 0, rarity: "Comum" },
	shadow_daggers: { name: "Lâminas sombrias", type: "Arma", slot: "weapon", classes: ["rogue"], damage: 16, cost: 125, rarity: "Raro" },
	paladin_blade: { name: "Espada juramentada", type: "Arma", slot: "weapon", classes: ["paladin"], damage: 8, defense: 3, cost: 0, rarity: "Comum" },
	sunblade: { name: "Lâmina solar", type: "Arma", slot: "weapon", classes: ["paladin"], damage: 16, magic: 6, cost: 135, rarity: "Raro" },
	druid_staff: { name: "Cajado de salgueiro", type: "Arma", slot: "weapon", classes: ["druid"], damage: 4, magic: 10, cost: 0, rarity: "Comum" },
	elder_staff: { name: "Cajado ancestral", type: "Arma", slot: "weapon", classes: ["mage", "druid"], damage: 7, magic: 16, cost: 140, rarity: "Épico" },
	travel_cloak: { name: "Manto de viagem", type: "Roupa", slot: "armor", defense: 2, hp: 18, lootTier: 0, color: "#8f9571", cost: 0, rarity: "Comum" },
	hide_jerkin: { name: "Gibão de couro", type: "Roupa", slot: "armor", defense: 4, hp: 10, strength: 1, agility: 1, lootTier: 1, color: "#855638", cost: 85, rarity: "Incomum" },
	ranger_vest: { name: "Colete de patrulheiro", type: "Roupa", slot: "armor", defense: 6, hp: 24, agility: 2, bowSkill: 1, lootTier: 2, color: "#52744f", cost: 145, rarity: "Raro" },
	scholar_robe: { name: "Túnica de estudioso", type: "Roupa", slot: "armor", defense: 3, hp: 12, mp: 18, intelligence: 2, magicPower: 2, lootTier: 2, color: "#6c64a2", cost: 150, rarity: "Raro" },
	fur_mantle: { name: "Manto de pele reforçado", type: "Roupa", slot: "armor", defense: 7, hp: 28, vitality: 2, lootTier: 3, color: "#a89d83", cost: 230, rarity: "Épico" },
	stormweave: { name: "Vestes da tempestade", type: "Roupa", slot: "armor", defense: 8, mp: 22, agility: 2, magicPower: 2, lootTier: 4, color: "#4b7f99", cost: 340, rarity: "Épico" },
	dragon_mail: { name: "Couraça de escamas dracônicas", type: "Roupa", slot: "armor", defense: 12, hp: 42, strength: 2, vitality: 2, lootTier: 5, color: "#9e4b39", cost: 500, rarity: "Lendário" },
	grove_armor: { name: "Armadura do guardião verde", type: "Roupa", slot: "armor", defense: 10, hp: 32, resistances: { nature: 0.25 }, lootTier: 3, color: "#55783f", cost: 0, rarity: "Épico" },
	tide_armor: { name: "Armadura das marés", type: "Roupa", slot: "armor", defense: 11, hp: 35, resistances: { water: 0.25 }, lootTier: 4, color: "#397f91", cost: 0, rarity: "Épico" },
	ember_armor: { name: "Armadura do coração ígneo", type: "Roupa", slot: "armor", defense: 12, hp: 38, resistances: { fire: 0.25 }, lootTier: 5, color: "#a94d36", cost: 0, rarity: "Lendário" },
	storm_armor: { name: "Armadura do trovão", type: "Roupa", slot: "armor", defense: 12, hp: 36, resistances: { lightning: 0.25 }, lootTier: 5, color: "#536e9d", cost: 0, rarity: "Lendário" },
	grove_weapon: { name: "Lâmina-raiz", type: "Arma", slot: "weapon", classes: ["tank", "mage", "warrior", "archer", "healer", "rogue", "paladin", "druid"], damage: 12, elementalDamage: { nature: 0.18 }, element: "nature", lootTier: 3, cost: 0, rarity: "Épico" },
	tide_weapon: { name: "Tridente das profundezas", type: "Arma", slot: "weapon", classes: ["tank", "mage", "warrior", "archer", "healer", "rogue", "paladin", "druid"], damage: 14, elementalDamage: { water: 0.2 }, element: "water", lootTier: 4, cost: 0, rarity: "Épico" },
	ember_weapon: { name: "Espada de magma", type: "Arma", slot: "weapon", classes: ["tank", "mage", "warrior", "archer", "healer", "rogue", "paladin", "druid"], damage: 16, elementalDamage: { fire: 0.22 }, element: "fire", lootTier: 5, cost: 0, rarity: "Lendário" },
	storm_weapon: { name: "Arco do trovão", type: "Arma", slot: "weapon", classes: ["tank", "mage", "warrior", "archer", "healer", "rogue", "paladin", "druid"], damage: 16, elementalDamage: { lightning: 0.22 }, element: "lightning", lootTier: 5, cost: 0, rarity: "Lendário" },
	grove_charm: { name: "Broche da seiva", type: "Acessório", slot: "charm", elementalDamage: { nature: 0.12 }, element: "nature", cost: 0, rarity: "Épico" },
	tide_charm: { name: "Concha das marés", type: "Acessório", slot: "charm", elementalDamage: { water: 0.14 }, element: "water", cost: 0, rarity: "Épico" },
	ember_charm: { name: "Medalhão da brasa", type: "Acessório", slot: "charm", elementalDamage: { fire: 0.16 }, element: "fire", cost: 0, rarity: "Lendário" },
	storm_charm: { name: "Anel da tempestade", type: "Acessório", slot: "charm", elementalDamage: { lightning: 0.16 }, element: "lightning", cost: 0, rarity: "Lendário" },
	rune_blade: { name: "Lâmina rúnica", type: "Arma", slot: "weapon", classes: ["warrior", "paladin"], damage: 17, strength: 2, lootTier: 3, cost: 390, rarity: "Épico" },
	moon_bow: { name: "Arco lunar", type: "Arma", slot: "weapon", classes: ["archer"], damage: 11, agility: 2, bowSkill: 3, lootTier: 3, cost: 360, rarity: "Épico" },
	bloodwood_staff: { name: "Cajado de sangue-vivo", type: "Arma", slot: "weapon", classes: ["mage", "healer", "druid"], damage: 8, magic: 19, magicPower: 2, lootTier: 4, cost: 470, rarity: "Épico" },
	warden_mace: { name: "Maça do guardião", type: "Arma", slot: "weapon", classes: ["tank", "paladin"], damage: 12, defense: 8, vitality: 2, lootTier: 4, cost: 430, rarity: "Épico" },
	obsidian_daggers: { name: "Adagas de obsidiana", type: "Arma", slot: "weapon", classes: ["rogue"], damage: 19, agility: 2, lootTier: 5, cost: 560, rarity: "Lendário" },
	hearth_charm: { name: "Pingente do coração", type: "Acessório", slot: "charm", hp: 32, vitality: 2, cost: 245, rarity: "Raro" },
	arcane_charm: { name: "Sigilo arcano", type: "Acessório", slot: "charm", mp: 26, magic: 7, magicPower: 1, cost: 310, rarity: "Raro" },
	frost_charm: { name: "Cristal do inverno", type: "Acessório", slot: "charm", resistances: { ice: 0.2 }, elementalDamage: { ice: 0.12 }, lootTier: 4, cost: 0, rarity: "Épico" },
	crypt_charm: { name: "Selo do crepúsculo", type: "Acessório", slot: "charm", resistances: { dark: 0.2 }, elementalDamage: { dark: 0.15 }, lootTier: 5, cost: 0, rarity: "Lendário" },
	frost_weapon: { name: "Lança da aurora boreal", type: "Arma", slot: "weapon", classes: ["tank", "mage", "warrior", "archer", "healer", "rogue", "paladin", "druid"], damage: 15, elementalDamage: { ice: 0.2 }, lootTier: 4, cost: 0, rarity: "Épico" },
	crypt_weapon: { name: "Lâmina do eclipse", type: "Arma", slot: "weapon", classes: ["tank", "mage", "warrior", "archer", "healer", "rogue", "paladin", "druid"], damage: 18, magic: 7, elementalDamage: { dark: 0.22 }, lootTier: 5, cost: 0, rarity: "Lendário" },
	frost_armor: { name: "Manto do degelo", type: "Roupa", slot: "armor", defense: 11, hp: 35, resistances: { ice: 0.25 }, lootTier: 4, color: "#7399a7", cost: 0, rarity: "Épico" },
	crypt_armor: { name: "Armadura do eclipse", type: "Roupa", slot: "armor", defense: 14, hp: 40, magicPower: 2, resistances: { dark: 0.2 }, lootTier: 5, color: "#54445e", cost: 0, rarity: "Lendário" },
	dune_weapon: { name: "Lança das dunas", type: "Arma", slot: "weapon", classes: ["tank", "mage", "warrior", "archer", "healer", "rogue", "paladin", "druid", "necromancer", "monk"], damage: 21, elementalDamage: { earth: 0.2 }, lootTier: 6, cost: 0, rarity: "Lendário" },
	dune_armor: { name: "Couraça do deserto", type: "Roupa", slot: "armor", defense: 15, hp: 45, agility: 2, lootTier: 6, color: "#b58b50", cost: 0, rarity: "Lendário" },
	crystal_weapon: { name: "Cajado prismático", type: "Arma", slot: "weapon", classes: ["tank", "mage", "warrior", "archer", "healer", "rogue", "paladin", "druid", "necromancer", "monk"], damage: 23, magic: 12, elementalDamage: { arcane: 0.24 }, lootTier: 7, cost: 0, rarity: "Lendário" },
	crystal_armor: { name: "Manto de cristal vivo", type: "Roupa", slot: "armor", defense: 16, hp: 52, mp: 24, resistances: { arcane: 0.2 }, lootTier: 7, color: "#7b9db2", cost: 0, rarity: "Lendário" },
	dune_charm: { name: "Ampulheta ancestral", type: "Acessório", slot: "charm", hp: 38, strength: 2, elementalDamage: { earth: 0.16 }, lootTier: 6, cost: 0, rarity: "Lendário" },
	crystal_charm: { name: "Prisma do infinito", type: "Acessório", slot: "charm", mp: 35, magicPower: 2, elementalDamage: { arcane: 0.18 }, lootTier: 7, cost: 0, rarity: "Lendário" },
	necromancer_staff: { name: "Cetro dos esquecidos", type: "Arma", slot: "weapon", classes: ["necromancer"], damage: 5, magic: 16, cost: 0, rarity: "Comum" },
	bone_staff: { name: "Cetro de ossos antigos", type: "Arma", slot: "weapon", classes: ["necromancer"], damage: 9, magic: 22, cost: 160, rarity: "Épico" },
	monk_wraps: { name: "Faixas de combate", type: "Arma", slot: "weapon", classes: ["monk"], damage: 8, agility: 2, cost: 0, rarity: "Comum" },
	monk_gauntlets: { name: "Manoplas do vendaval", type: "Arma", slot: "weapon", classes: ["monk"], damage: 17, agility: 3, cost: 170, rarity: "Épico" },
	rune_mail: { name: "Cota rúnica", type: "Roupa", slot: "armor", defense: 9, hp: 25, strength: 1, lootTier: 3, color: "#8b8068", cost: 0, rarity: "Épico" },
	verdant_robe: { name: "Veste do bosque antigo", type: "Roupa", slot: "armor", defense: 6, hp: 18, mp: 25, magicPower: 2, lootTier: 3, color: "#62815b", cost: 0, rarity: "Épico" },
	minor_potion: { name: "Poção rubra", type: "Consumível", heal: 48, cost: 16, rarity: "Comum" },
	mana_tonic: { name: "Tônico azul", type: "Consumível", mana: 38, cost: 14, rarity: "Comum" },
	slime_gel: { name: "Gel de limo", type: "Material", cost: 5, rarity: "Comum" },
	wolf_pelt: { name: "Pele selvagem", type: "Material", cost: 11, rarity: "Incomum" },
	spider_silk: { name: "Seda de aranha", type: "Material", cost: 15, rarity: "Incomum" },
	frost_shard: { name: "Estilhaço glacial", type: "Material", cost: 22, rarity: "Raro" },
	stone_heart: { name: "Coração de pedra", type: "Material", cost: 25, rarity: "Raro" },
	ember_scale: { name: "Escama de brasa", type: "Material", cost: 30, rarity: "Épico" },
	ash_token: { name: "Selo de cinzas", type: "Material", cost: 24, rarity: "Raro" },
	boss_core: { name: "Núcleo antigo", type: "Material", cost: 85, rarity: "Épico" },
	copper_ore: { name: "Minério de cobre", type: "Material", cost: 9, rarity: "Comum" },
	iron_ore: { name: "Minério de ferro", type: "Material", cost: 18, rarity: "Incomum" },
	moon_dust: { name: "Pó lunar", type: "Material", cost: 32, rarity: "Raro" },
	void_essence: { name: "Essência do vazio", type: "Material", cost: 42, rarity: "Épico" },
	dragon_scale: { name: "Escama dracônica", type: "Material", cost: 48, rarity: "Épico" },
	desert_glass: { name: "Vidro do deserto", type: "Material", cost: 38, rarity: "Raro" },
	prism_shard: { name: "Fragmento prismático", type: "Material", cost: 55, rarity: "Épico" },
	ancient_bone: { name: "Osso ancestral", type: "Material", cost: 34, rarity: "Raro" },
	tank_sword: { name: "Espada de guarda", type: "Arma", slot: "weapon", classes: ["tank"], damage: 6, cost: 0, rarity: "Comum" },
	iron_helm: { name: "Elmo de ferro", type: "Capacete", slot: "helmet", defense: 4, hp: 12, cost: 95, rarity: "Incomum" },
	arcane_hat: { name: "Chapéu de arcanista", type: "Chapéu", slot: "helmet", classes: ["mage", "healer", "bard", "necromancer"], defense: 1, mp: 18, magic: 4, cost: 120, rarity: "Raro" },
	leather_glove_left: { name: "Luva de couro (esquerda)", type: "Luva", slot: "gloves1", defense: 1, agility: 1, cost: 35, rarity: "Comum" },
	leather_glove_right: { name: "Luva de couro (direita)", type: "Luva", slot: "gloves2", defense: 1, strength: 1, cost: 35, rarity: "Comum" },
	steel_gauntlet_left: { name: "Manopla de aço (esquerda)", type: "Luva", slot: "gloves1", defense: 3, strength: 1, cost: 100, rarity: "Incomum" },
	steel_gauntlet_right: { name: "Manopla de aço (direita)", type: "Luva", slot: "gloves2", defense: 3, vitality: 1, cost: 100, rarity: "Incomum" },
	trail_boots: { name: "Botas de trilha", type: "Botas", slot: "boots", defense: 2, agility: 1, cost: 65, rarity: "Comum" },
	iron_greaves: { name: "Grevas de ferro", type: "Calças", slot: "pants", defense: 4, hp: 14, cost: 110, rarity: "Incomum" },
	wide_belt: { name: "Cinto de viajante", type: "Cinto", slot: "belt", hp: 12, vitality: 1, cost: 55, rarity: "Comum" },
	moon_necklace: { name: "Colar de pó lunar", type: "Colar", slot: "necklace", mp: 16, intelligence: 1, cost: 90, rarity: "Incomum" },
	copper_bracelet_left: { name: "Bracelete de cobre (esquerdo)", type: "Bracelete", slot: "bracelet1", defense: 1, magic: 2, cost: 50, rarity: "Comum" },
	copper_bracelet_right: { name: "Bracelete de cobre (direito)", type: "Bracelete", slot: "bracelet2", defense: 1, damage: 2, cost: 50, rarity: "Comum" },
	sea_tunic: { name: "Túnica das enseadas", type: "Roupa", slot: "armor", defense: 9, hp: 34, resistances: { water: 0.2 }, lootTier: 8, color: "#43838b", cost: 0, rarity: "Épico" },
	jungle_mail: { name: "Cota do coração verde", type: "Roupa", slot: "armor", defense: 13, hp: 46, resistances: { nature: 0.2 }, lootTier: 9, color: "#4b783f", cost: 0, rarity: "Lendário" },
	abyssal_necklace: { name: "Colar da maré profunda", type: "Colar", slot: "necklace", mp: 32, magic: 8, elementalDamage: { water: 0.18 }, lootTier: 8, cost: 0, rarity: "Épico" },
	worldroot_belt: { name: "Cinto da raiz-mundo", type: "Cinto", slot: "belt", hp: 48, vitality: 2, elementalDamage: { nature: 0.14 }, lootTier: 9, cost: 0, rarity: "Lendário" },
	tide_spear: { name: "Tridente do recife", type: "Arma", slot: "weapon", classes: ["tank", "warrior", "paladin", "duelist"], damage: 24, elementalDamage: { water: 0.2 }, lootTier: 8, cost: 0, rarity: "Lendário" },
	jungle_bow: { name: "Arco da copa ancestral", type: "Arma", slot: "weapon", classes: ["archer", "ranger"], damage: 27, agility: 3, elementalDamage: { nature: 0.2 }, lootTier: 9, cost: 0, rarity: "Lendário" },
	bard_lyre: { name: "Lira dos ecos", type: "Arma", slot: "weapon", classes: ["bard"], damage: 12, magic: 24, lootTier: 5, cost: 440, rarity: "Épico" },
	ranger_longbow: { name: "Arco longo da mata", type: "Arma", slot: "weapon", classes: ["ranger"], damage: 18, agility: 2, bowSkill: 3, lootTier: 5, cost: 450, rarity: "Épico" },
	duelist_sabre: { name: "Sabre do crepúsculo", type: "Arma", slot: "weapon", classes: ["duelist"], damage: 20, agility: 3, lootTier: 5, cost: 460, rarity: "Épico" },
	coral_fragment: { name: "Fragmento de coral", type: "Material", cost: 42, rarity: "Raro" },
	heartwood: { name: "Madeira-coração", type: "Material", cost: 47, rarity: "Épico" },
	bard_lute: { name: "Alaúde da viajante", type: "Arma", slot: "weapon", classes: ["bard"], damage: 5, magic: 10, cost: 0, rarity: "Comum" },
	ranger_bow: { name: "Arco da patrulheira", type: "Arma", slot: "weapon", classes: ["ranger"], damage: 7, agility: 1, cost: 0, rarity: "Comum" },
	duelist_rapier: { name: "Florete de duelista", type: "Arma", slot: "weapon", classes: ["duelist"], damage: 8, agility: 1, cost: 0, rarity: "Comum" },
	mossbound_boots: { name: "Botas do musgo antigo", type: "Botas", slot: "boots", defense: 1, agility: 3, resistances: { nature: 0.08 }, lootTier: 1, lootBiome: "forest", cost: 185, rarity: "Raro" },
	abyssal_bracers: { name: "Braceletes do abismo", type: "Bracelete", slot: "bracelet1", defense: 3, intelligence: 1, resistances: { water: 0.12 }, lootTier: 2, lootBiome: "marsh", cost: 260, rarity: "Raro" },
	emberheart_ring: { name: "Anel do coração ígneo", type: "Bracelete", slot: "bracelet2", damage: 4, strength: 1, elementalDamage: { fire: 0.08 }, lootTier: 3, lootBiome: "ember", cost: 310, rarity: "Épico" },
	tempest_spurs: { name: "Esporas da tormenta", type: "Botas", slot: "boots", defense: 2, agility: 4, resistances: { lightning: 0.08 }, lootTier: 4, lootBiome: "storm", cost: 360, rarity: "Épico" },
	glacier_circlet: { name: "Diadema da aurora", type: "Capacete", slot: "helmet", defense: 3, mp: 22, resistances: { ice: 0.1 }, lootTier: 5, lootBiome: "frost", cost: 390, rarity: "Épico" },
	mourning_veil: { name: "Véu da noite eterna", type: "Colar", slot: "necklace", magic: 6, magicPower: 2, resistances: { dark: 0.15 }, lootTier: 6, lootBiome: "marsh", cost: 430, rarity: "Épico" },
	sandstalker_greaves: { name: "Grevas do rastreador", type: "Calças", slot: "pants", defense: 4, agility: 2, resistances: { earth: 0.12 }, lootTier: 7, lootBiome: "desert", cost: 470, rarity: "Épico" },
	prismatic_mantle: { name: "Manto prismático", type: "Roupa", slot: "armor", defense: 8, mp: 22, resistances: { arcane: 0.14 }, lootTier: 8, lootBiome: "crystal", color: "#83a8b7", cost: 520, rarity: "Lendário" },
	coralweave_sash: { name: "Faixa de coral vivo", type: "Cinto", slot: "belt", hp: 32, agility: 1, elementalDamage: { water: 0.1 }, lootTier: 9, lootBiome: "coast", cost: 590, rarity: "Lendário" },
	worldroot_vambraces: { name: "Vambraces da raiz-mundo", type: "Luva", slot: "gloves2", defense: 5, vitality: 1, elementalDamage: { nature: 0.12 }, lootTier: 9, lootBiome: "jungle", cost: 650, rarity: "Lendário" },
};

const equipmentSlots = [
	["helmet", "Cabeça"], ["weapon", "Arma"], ["shield", "Escudo"], ["armor", "Peitoral / manto"],
	["gloves1", "Luva esquerda"], ["gloves2", "Luva direita"], ["pants", "Calças"], ["boots", "Pés"],
	["necklace", "Colar"], ["belt", "Cinto"], ["bracelet1", "Bracelete 1"], ["bracelet2", "Bracelete 2"],
];
const equipmentSlotKeys = equipmentSlots.map(([slot]) => slot);

function getEquipmentSlot(item) {
	if (item?.slot === "armor") return "armor";
	if (item?.slot === "charm") return "necklace";
	return item?.slot;
}

function createEquipment() {
	return Object.fromEntries(equipmentSlotKeys.map((slot) => [slot, null]));
}

const elementNames = {
	nature: "natureza", water: "água", fire: "fogo", lightning: "raio",
	ice: "gelo", earth: "terra", radiant: "sagrado", arcane: "arcano", dark: "escuridão", blood: "sangue", poison: "veneno", physical: "físico",
};

const races = {
	human: { name: "Humana", maleName: "Humano", passive: "Sem bônus ou fraquezas; equilibrada em todos os aspectos.", skill: "second_wind" },
	elf: { name: "Elfa", maleName: "Elfo", passive: "+25% de dano mágico e +20% de ataque com arco; magias da natureza recebem +50%.", skill: "starfall" },
	vampire: { name: "Vampira", maleName: "Vampiro", passive: "Roubo de vida corpo a corpo; mais fraca de dia e mais forte à noite. Pode escolher escuridão ou sangue como elemento mágico.", skill: "blood_burst" },
	dwarf: { name: "Anã", maleName: "Anão", passive: "+3 de defesa e coleta 25% mais ouro.", skill: "stone_guard" },
	orc: { name: "Orc", passive: "+4 de dano físico.", skill: "brutal_strike" },
	halfling: { name: "Halfling", passive: "+18 de velocidade de movimento.", skill: "swift_flurry" },
	gnome: { name: "Gnoma", maleName: "Gnomo", passive: "Magias de cura restauram 15% a mais.", skill: "arcane_surge" },
	draconian: { name: "Draconiana", maleName: "Draconiano", passive: "+15% de resistência ao fogo e +10% de dano ígneo.", skill: "dragon_breath" },
	merfolk: { name: "Ondina", maleName: "Ondino", passive: "+12% de dano de água e +12% de resistência à água.", skill: "tide_call" },
	goblin: { name: "Goblin", passive: "+15% de ouro coletado e mais agilidade.", skill: "dirty_trick" },
	fairy: { name: "Feérica", maleName: "Feérico", passive: "+12% de dano mágico e cura mais potente.", skill: "fairy_glimmer" },
	beastkin: { name: "Bestial", maleName: "Bestial", passive: "+12 de velocidade e +2 de dano físico.", skill: "beast_pounce" },
	tiefling: { name: "Tiefling", passive: "+20% de resistência ao fogo e +10% de dano sombrio.", skill: "hellfire" },
};

const classes = {
	tank: { name: "Tank", weapon: "tank_sword", rewardWeapon: "guardian_shield", skills: ["shield_bash", "iron_guard", "challenge", "shield_throw", "fortress"], stats: { strength: 2, vitality: 5, intelligence: 1, agility: 1, magicPower: 1, bowSkill: 1 }, ranged: false, color: "#78919a" },
	mage: { name: "Maga elemental", maleName: "Mago elemental", weapon: "apprentice_staff", rewardWeapon: "oak_staff", stats: { strength: 1, vitality: 1, intelligence: 5, agility: 2, magicPower: 4, bowSkill: 1 }, ranged: true, color: "#8874a7" },
	warrior: { name: "Guerreira", maleName: "Guerreiro", weapon: "wood_sword", rewardWeapon: "guardian_sword", skills: ["heavy_strike", "whirlwind", "execute", "earth_shaker", "battle_rush"], stats: { strength: 4, vitality: 3, intelligence: 1, agility: 2, magicPower: 1, bowSkill: 1 }, ranged: false, color: "#ad654c" },
	archer: { name: "Arqueira", maleName: "Arqueiro", weapon: "hunting_bow", rewardWeapon: "longbow", skills: ["aimed_shot", "multishot", "poison_arrow", "piercing_arrow", "rain_of_arrows"], stats: { strength: 2, vitality: 2, intelligence: 2, agility: 5, magicPower: 1, bowSkill: 4 }, ranged: true, color: "#648254" },
	healer: { name: "Maga de cura", maleName: "Mago de cura", weapon: "priest_staff", rewardWeapon: "sanctuary_staff", skills: ["mend", "renew", "radiant_burst", "guardian_light", "purifying_wave"], stats: { strength: 1, vitality: 2, intelligence: 5, agility: 2, magicPower: 4, bowSkill: 1 }, ranged: true, color: "#c09862" },
	rogue: { name: "Ladina", maleName: "Ladino", weapon: "rogue_dagger", rewardWeapon: "shadow_daggers", skills: ["backstab", "evasion", "fan_knives", "shadow_step", "venom_barrage"], stats: { strength: 3, vitality: 2, intelligence: 1, agility: 5, magicPower: 1, bowSkill: 2 }, ranged: false, color: "#66715d" },
	paladin: { name: "Paladina", maleName: "Paladino", weapon: "paladin_blade", rewardWeapon: "sunblade", skills: ["smite", "holy_light", "radiant_burst", "judgment", "divine_aegis"], stats: { strength: 3, vitality: 4, intelligence: 3, agility: 1, magicPower: 3, bowSkill: 1 }, ranged: false, color: "#c09e57" },
	druid: { name: "Druida", maleName: "Druida", weapon: "druid_staff", rewardWeapon: "elder_staff", skills: ["thorn_burst", "barkskin", "wild_growth", "storm_roots", "primal_bloom"], stats: { strength: 1, vitality: 3, intelligence: 4, agility: 2, magicPower: 4, bowSkill: 1 }, ranged: true, color: "#5c8b5a" },
	necromancer: { name: "Necromante", maleName: "Necromante", weapon: "necromancer_staff", rewardWeapon: "bone_staff", skills: ["shadow_bolt", "soul_siphon", "grave_ward", "spirit_volley", "death_mark"], stats: { strength: 1, vitality: 2, intelligence: 5, agility: 2, magicPower: 5, bowSkill: 1 }, ranged: true, color: "#705b80" },
	monk: { name: "Monja", maleName: "Monge", weapon: "monk_wraps", rewardWeapon: "monk_gauntlets", skills: ["quick_palm", "flowing_guard", "tempest_kick", "dragon_palm", "inner_focus"], stats: { strength: 4, vitality: 3, intelligence: 2, agility: 4, magicPower: 1, bowSkill: 1 }, ranged: false, color: "#b18d58" },
	bard: { name: "Barda", maleName: "Bardo", weapon: "bard_lute", rewardWeapon: "bard_lyre", skills: ["soothing_chord", "dissonant_note", "rallying_song", "echo_blast", "finale"], stats: { strength: 1, vitality: 2, intelligence: 4, agility: 3, magicPower: 4, bowSkill: 1 }, ranged: true, color: "#9b668c" },
	ranger: { name: "Patrulheira", maleName: "Patrulheiro", weapon: "ranger_bow", rewardWeapon: "ranger_longbow", skills: ["snare_shot", "hunter_mark", "quick_volley", "wild_trap", "falcon_strike"], stats: { strength: 2, vitality: 2, intelligence: 2, agility: 5, magicPower: 1, bowSkill: 5 }, ranged: true, color: "#70844d" },
	duelist: { name: "Duelista", weapon: "duelist_rapier", rewardWeapon: "duelist_sabre", skills: ["riposte", "lunge", "feint", "crossing_blades", "perfect_form"], stats: { strength: 4, vitality: 2, intelligence: 2, agility: 5, magicPower: 1, bowSkill: 1 }, ranged: false, color: "#a97858" },
};

const skillInfo = {
	shield_bash: { name: "Escudada", level: 1, cost: 8, cooldown: 2, description: "Golpe curto que causa dano e interrompe o alvo.", kind: "melee", power: 1.4 },
	 iron_guard: { name: "Muralha", level: 2, cost: 14, cooldown: 9, description: "Ganha 12 de defesa por 5 segundos.", kind: "guard", power: 12 },
	challenge: { name: "Desafio", level: 3, cost: 18, cooldown: 8, description: "Provoca inimigos próximos e reduz o dano recebido.", kind: "taunt", power: 8 },
	fireball: { name: "Bola de fogo", level: 1, cost: 10, cooldown: 2.4, description: "Projétil elemental que incendeia o alvo distante.", kind: "fire", power: 1.6 },
	ice_lance: { name: "Lança de gelo", level: 2, cost: 14, cooldown: 4, description: "Disparo gélido de longo alcance e alto impacto.", kind: "ice", power: 1.8, damageType: "ice" },
	chain_lightning: { name: "Cadeia elétrica", level: 3, cost: 22, cooldown: 7, description: "Atinge até três inimigos com raios em cadeia.", kind: "chain", power: 1.3, damageType: "lightning" },
	heavy_strike: { name: "Golpe pesado", level: 1, cost: 8, cooldown: 2, description: "Ataque corpo a corpo com força ampliada.", kind: "melee", power: 1.7 },
	whirlwind: { name: "Redemoinho", level: 2, cost: 18, cooldown: 6, description: "Gira e atinge todos os inimigos ao redor.", kind: "spin", power: 1.35 },
	execute: { name: "Execução", level: 3, cost: 20, cooldown: 7, description: "Golpe devastador, ainda mais forte contra alvos feridos.", kind: "execute", power: 2.5 },
	aimed_shot: { name: "Tiro certeiro", level: 1, cost: 8, cooldown: 2, description: "Flecha precisa de alcance longo e dano elevado.", kind: "shot", power: 1.8 },
	multishot: { name: "Chuva de flechas", level: 2, cost: 16, cooldown: 5, description: "Dispara contra até três inimigos próximos.", kind: "volley", power: 1.05 },
	poison_arrow: { name: "Flecha tóxica", level: 3, cost: 18, cooldown: 6, description: "Flecha de longo alcance que envenena o alvo.", kind: "poison", power: 1.35, damageType: "poison" },
	mend: { name: "Cura serena", level: 1, cost: 10, cooldown: 6, description: "Restaura vida própria ou de um aliado próximo.", kind: "heal", power: 42 },
	renew: { name: "Renovação", level: 2, cost: 16, cooldown: 8, description: "Recupera vida continuamente por 5 segundos.", kind: "renew", power: 10 },
	radiant_burst: { name: "Clarão sagrado", level: 3, cost: 22, cooldown: 7, description: "Explosão mágica de longo alcance que fere inimigos.", kind: "radiant", power: 1.5, damageType: "radiant" },
	backstab: { name: "Ataque furtivo", level: 1, cost: 8, cooldown: 2, description: "Golpe de adaga preciso contra um inimigo próximo.", kind: "melee", power: 2 },
	evasion: { name: "Esquiva", level: 2, cost: 14, cooldown: 8, description: "Reduz o dano recebido com uma esquiva ágil.", kind: "guard", power: 9 },
	fan_knives: { name: "Leque de lâminas", level: 3, cost: 18, cooldown: 6, description: "Atinge os inimigos próximos com adagas.", kind: "spin", power: 1.15 },
	smite: { name: "Golpe sagrado", level: 1, cost: 9, cooldown: 2.2, description: "Ataque de espada imbuído de energia sagrada.", kind: "melee", power: 1.7, damageType: "radiant" },
	holy_light: { name: "Luz sagrada", level: 2, cost: 15, cooldown: 7, description: "Restaura seus pontos de vida com magia.", kind: "heal", power: 48 },
	thorn_burst: { name: "Espinhos da natureza", level: 1, cost: 10, cooldown: 2.5, description: "Projétil de espinhos que alcança um inimigo distante.", kind: "nature", power: 1.45, damageType: "nature" },
	barkskin: { name: "Casca protetora", level: 2, cost: 14, cooldown: 9, description: "Ganha 10 de defesa por 5 segundos.", kind: "guard", power: 10 },
	wild_growth: { name: "Crescimento selvagem", level: 3, cost: 18, cooldown: 8, description: "Recupera vida continuamente por 5 segundos.", kind: "renew", power: 13 },
	shield_throw: { name: "Arremesso de escudo", level: 4, cost: 16, cooldown: 4, description: "Arremessa o escudo contra um alvo distante.", kind: "shot", power: 1.8 },
	fortress: { name: "Fortaleza", level: 5, cost: 22, cooldown: 12, description: "Ergue uma defesa poderosa por alguns segundos.", kind: "guard", power: 20 },
	water_surge: { name: "Onda arcana", level: 4, cost: 18, cooldown: 4, description: "Lança uma onda de água contra um inimigo.", kind: "elemental", power: 1.8, damageType: "water" },
	arcane_wave: { name: "Onda arcana", level: 5, cost: 24, cooldown: 7, description: "Dispara uma rajada de energia arcana.", kind: "elemental", power: 2, damageType: "arcane" },
	earth_shaker: { name: "Abalo sísmico", level: 4, cost: 18, cooldown: 6, description: "Atinge todos os inimigos próximos com força.", kind: "spin", power: 1.6, damageType: "earth" },
	battle_rush: { name: "Investida", level: 5, cost: 20, cooldown: 7, description: "Avança com um golpe devastador.", kind: "melee", power: 2.4 },
	piercing_arrow: { name: "Flecha perfurante", level: 4, cost: 15, cooldown: 3, description: "Flecha precisa que atravessa a defesa do alvo.", kind: "shot", power: 2.1 },
	rain_of_arrows: { name: "Tempestade de flechas", level: 5, cost: 23, cooldown: 7, description: "Atinge vários inimigos com uma chuva de flechas.", kind: "volley", power: 1.35 },
	guardian_light: { name: "Luz guardiã", level: 4, cost: 18, cooldown: 10, description: "Cria uma barreira de proteção.", kind: "guard", power: 16 },
	purifying_wave: { name: "Onda purificadora", level: 5, cost: 24, cooldown: 7, description: "Fere um inimigo com energia sagrada.", kind: "elemental", power: 1.9, damageType: "radiant" },
	shadow_step: { name: "Passo das sombras", level: 4, cost: 16, cooldown: 4, description: "Golpe preciso que corta pelas sombras.", kind: "melee", power: 2.3 },
	venom_barrage: { name: "Rajada venenosa", level: 5, cost: 21, cooldown: 6, description: "Envenena o alvo com uma sequência de lâminas.", kind: "poison", power: 1.65, damageType: "poison" },
	judgment: { name: "Julgamento", level: 4, cost: 20, cooldown: 5, description: "Fere o alvo com um golpe sagrado à distância.", kind: "elemental", power: 1.8, damageType: "radiant" },
	divine_aegis: { name: "Égide divina", level: 5, cost: 22, cooldown: 12, description: "Recebe uma grande proteção temporária.", kind: "guard", power: 20 },
	storm_roots: { name: "Raízes trovejantes", level: 4, cost: 18, cooldown: 4, description: "Raízes carregadas de eletricidade atingem o alvo.", kind: "elemental", power: 1.8, damageType: "lightning" },
	primal_bloom: { name: "Florescer primordial", level: 5, cost: 22, cooldown: 9, description: "Recupera vida continuamente.", kind: "renew", power: 16 },
	second_wind: { name: "Segundo fôlego", level: 1, cost: 12, cooldown: 8, description: "Recupera vida com determinação.", kind: "heal", power: 55, race: "human" },
	starfall: { name: "Chuva estelar", level: 2, cost: 16, cooldown: 5, description: "Um raio estelar atinge um inimigo distante.", kind: "elemental", power: 1.7, damageType: "lightning", race: "elf" },
	blood_burst: { name: "Explosão sanguínea", level: 2, cost: 15, cooldown: 5, description: "Golpe próximo que absorve parte da vida do alvo.", kind: "melee", power: 1.9, lifeSteal: 0.25, race: "vampire" },
	stone_guard: { name: "Pele de granito", level: 2, cost: 16, cooldown: 10, description: "Aumenta a defesa temporariamente.", kind: "guard", power: 15, race: "dwarf" },
	brutal_strike: { name: "Golpe brutal", level: 1, cost: 12, cooldown: 4, description: "Um ataque corpo a corpo de força orc.", kind: "melee", power: 2, race: "orc" },
	swift_flurry: { name: "Rajada veloz", level: 1, cost: 16, cooldown: 6, description: "Atinge todos os inimigos próximos com golpes rápidos.", kind: "spin", power: 1.25, race: "halfling" },
	arcane_surge: { name: "Surto arcano", level: 2, cost: 18, cooldown: 5, description: "Dispara magia arcana contra um inimigo distante.", kind: "elemental", power: 1.75, damageType: "arcane", race: "gnome" },
	vampire_darkness: { name: "Dardo da escuridão", level: 1, cost: 10, cooldown: 2.5, description: "Projétil sombrio de longo alcance.", kind: "elemental", power: 1.5, damageType: "dark" },
	vampire_blood: { name: "Projétil de sangue", level: 2, cost: 15, cooldown: 5, description: "Projétil de sangue que restaura parte da vida ao atingir o alvo.", kind: "elemental", power: 1.7, damageType: "blood", lifeSteal: 0.35 },
	dragon_breath: { name: "Sopro dracônico", level: 1, cost: 12, cooldown: 4, description: "Uma rajada de fogo atinge inimigos próximos.", kind: "spin", power: 1.5, damageType: "fire", race: "draconian" },
	tide_call: { name: "Chamado das marés", level: 1, cost: 12, cooldown: 4, description: "Uma onda mágica atinge um inimigo distante.", kind: "elemental", power: 1.65, damageType: "water", race: "merfolk" },
	dirty_trick: { name: "Truque sujo", level: 1, cost: 10, cooldown: 3, description: "Um golpe rápido envenena o inimigo próximo.", kind: "melee", power: 1.5, damageType: "poison", race: "goblin" },
	shadow_bolt: { name: "Dardo umbrio", level: 1, cost: 10, cooldown: 2.5, description: "Dispara magia sombria contra um inimigo distante.", kind: "elemental", power: 1.5, damageType: "dark" },
	soul_siphon: { name: "Drenar essência", level: 2, cost: 16, cooldown: 6, description: "Rouba vida do alvo com um projétil sombrio.", kind: "elemental", power: 1.65, damageType: "dark", lifeSteal: 0.3 },
	grave_ward: { name: "Proteção tumular", level: 3, cost: 18, cooldown: 9, description: "Uma barreira de energia sombria reduz o dano recebido.", kind: "guard", power: 16 },
	spirit_volley: { name: "Rajada espiritual", level: 4, cost: 20, cooldown: 6, description: "Atinge até três inimigos com espíritos.", kind: "volley", power: 1.15, damageType: "dark" },
	death_mark: { name: "Marca da morte", level: 5, cost: 24, cooldown: 8, description: "Projétil sombrio devastador contra um alvo.", kind: "elemental", power: 2.5, damageType: "dark" },
	quick_palm: { name: "Palma veloz", level: 1, cost: 8, cooldown: 1.8, description: "Golpe desarmado rápido e preciso.", kind: "melee", power: 1.65 },
	flowing_guard: { name: "Guarda fluida", level: 2, cost: 12, cooldown: 8, description: "Desvia dos ataques com uma postura defensiva.", kind: "guard", power: 12 },
	tempest_kick: { name: "Chute tempestuoso", level: 3, cost: 16, cooldown: 5, description: "Um giro atinge todos os inimigos próximos.", kind: "spin", power: 1.5 },
	dragon_palm: { name: "Palma do dragão", level: 4, cost: 18, cooldown: 5, description: "Um golpe concentrado de energia física.", kind: "melee", power: 2, damageType: "physical" },
	inner_focus: { name: "Foco interior", level: 5, cost: 20, cooldown: 10, description: "Recupera vida e reforça a defesa.", kind: "renew", power: 15 },
	soothing_chord: { name: "Acorde sereno", level: 1, cost: 10, cooldown: 6, description: "Recupera seus pontos de vida com uma melodia.", kind: "heal", power: 42 },
	dissonant_note: { name: "Nota dissonante", level: 1, cost: 8, cooldown: 2, description: "Projétil sonoro que atinge um inimigo distante.", kind: "elemental", power: 1.55, damageType: "arcane" },
	rallying_song: { name: "Canção de coragem", level: 2, cost: 14, cooldown: 8, description: "Fortalece sua defesa por alguns segundos.", kind: "guard", power: 12 },
	echo_blast: { name: "Explosão de ecos", level: 4, cost: 18, cooldown: 5, description: "Rajada arcana contra um inimigo distante.", kind: "elemental", power: 2, damageType: "arcane" },
	finale: { name: "Grande final", level: 5, cost: 22, cooldown: 9, description: "Explosão mágica que atinge todos os inimigos próximos.", kind: "spin", power: 1.8, damageType: "radiant" },
	snare_shot: { name: "Flecha armadilhante", level: 1, cost: 9, cooldown: 3, description: "Flecha que fere e desacelera o alvo.", kind: "shot", power: 1.6 },
	hunter_mark: { name: "Marca da caça", level: 2, cost: 12, cooldown: 5, description: "Disparo certeiro contra um inimigo distante.", kind: "shot", power: 2 },
	quick_volley: { name: "Rajada veloz", level: 3, cost: 16, cooldown: 5, description: "Dispara contra vários inimigos próximos.", kind: "volley", power: 1.2 },
	wild_trap: { name: "Armadilha selvagem", level: 4, cost: 18, cooldown: 7, description: "Uma armadilha de natureza atinge o alvo.", kind: "nature", power: 1.8, damageType: "nature" },
	falcon_strike: { name: "Mergulho do falcão", level: 5, cost: 22, cooldown: 7, description: "Ataque à distância de grande precisão.", kind: "shot", power: 2.5 },
	riposte: { name: "Resposta rápida", level: 1, cost: 8, cooldown: 2, description: "Golpe veloz com o florete.", kind: "melee", power: 1.7 },
	lunge: { name: "Estocada", level: 2, cost: 12, cooldown: 3, description: "Estocada precisa contra um inimigo próximo.", kind: "melee", power: 2 },
	feint: { name: "Finta", level: 3, cost: 14, cooldown: 7, description: "Esquiva que reduz o dano recebido.", kind: "guard", power: 10 },
	crossing_blades: { name: "Lâminas cruzadas", level: 4, cost: 18, cooldown: 5, description: "Golpe que atinge todos os inimigos ao redor.", kind: "spin", power: 1.65 },
	perfect_form: { name: "Forma perfeita", level: 5, cost: 22, cooldown: 8, description: "Um golpe devastador de precisão.", kind: "execute", power: 2.5 },
	fairy_glimmer: { name: "Brilho feérico", level: 1, cost: 10, cooldown: 6, description: "Uma luz feérica recupera pontos de vida.", kind: "heal", power: 48, race: "fairy" },
	beast_pounce: { name: "Bote bestial", level: 1, cost: 10, cooldown: 3, description: "Salta sobre um inimigo com força.", kind: "melee", power: 1.8, race: "beastkin" },
	hellfire: { name: "Chama infernal", level: 1, cost: 12, cooldown: 4, description: "Projétil de fogo contra um inimigo distante.", kind: "elemental", power: 1.7, damageType: "fire", race: "tiefling" },
};

const mageElements = {
	fire: { name: "Fogo", spells: ["Faísca", "Bola de fogo", "Explosão ígnea", "Chuva de brasas", "Inferno flamejante"] },
	water: { name: "Água", spells: ["Jato d'água", "Lança de maré", "Onda profunda", "Vórtice", "Tsunami"] },
	ice: { name: "Gelo", spells: ["Estilhaço gelado", "Lança de gelo", "Tempestade gélida", "Prisão congelante", "Era glacial"] },
	lightning: { name: "Raio", spells: ["Raio elétrico", "Cadeia elétrica", "Tempestade elétrica", "Lança trovejante", "Cólera do céu"] },
	earth: { name: "Terra", spells: ["Projétil de pedra", "Lança pétrea", "Tremor da terra", "Espinhos de pedra", "Colosso de pedra"] },
	nature: { name: "Natureza", spells: ["Semente viva", "Espinhos verdes", "Raízes vivas", "Tempestade verde", "Florescer primordial"] },
	dark: { name: "Escuridão", skills: ["vampire_darkness"] },
	blood: { name: "Sangue", skills: ["vampire_blood"] },
};

for (const [element, definition] of Object.entries(mageElements)) {
	if (definition.skills) continue;
	definition.skills = definition.spells.map((name, index) => {
		const id = `mage_${element}_${index + 1}`;
		skillInfo[id] = {
			name, level: index + 1, cost: 10 + index * 4, cooldown: 2.4 + index * 0.6,
			description: `Projétil mágico de ${elementNames[element]} de longo alcance.`,
			kind: "elemental", power: 1.35 + index * 0.22, damageType: element,
		};
		return id;
	});
}

function isElementAvailableForRace(element, raceId) {
	return Boolean(mageElements[element] && (raceId === "vampire" || !["dark", "blood"].includes(element)));
}

function availableSkillIds(classId = state.player.classId) {
	const element = state.player.element;
	const classSkills = classId === "mage" && isElementAvailableForRace(element, state.player.raceId)
		? mageElements[element].skills
		: classId === "mage" ? [] : classes[classId]?.skills || [];
	const racialSkills = Object.values(races).filter((race) => race === races[state.player.raceId]).map((race) => race.skill).filter((id) => {
		const damageType = skillInfo[id].damageType;
		return classId !== "mage" || !damageType || damageType === element;
	});
	return [...new Set([...classSkills, ...racialSkills])];
}

const state = {
	scene: "world", started: false, dayTime: 0,
	room: 0, dungeonId: null,
	player: {
		x: 0, y: 0, level: 1, xp: 0, nextXp: 45, hp: 124, mp: 56,
		name: "Viajante", raceId: null, classId: null, element: null, appearance: "girl",
		coins: 35, stats: { strength: 3, vitality: 2, intelligence: 2, agility: 2, magicPower: 1, bowSkill: 1 },
		statPoints: 0, skillPoints: 0, inventory: ["minor_potion", "minor_potion", "slime_gel"],
		equipment: createEquipment(), status: [], facing: "down",
	},
	enemies: [], drops: [], floating: [], attacks: [], projectiles: [], skills: [], equippedSkills: [], cooldowns: {},
	quests: { kills: 0, bosses: 0 }, attackCooldown: 0, spawnTimer: 4,
	panel: null, toastTimer: 0, lastInteraction: null, saveTimer: 0, returnPosition: null,
};

const saveKey = "verdeJante-rpg-save-v1";
const selection = { raceId: null, classId: null, element: null, appearance: "girl" };
const legacyMageSkills = {
	fireball: "mage_fire_1", ice_lance: "mage_ice_2", chain_lightning: "mage_lightning_3",
	water_surge: "mage_water_4",
};

let viewWidth = 0;
let viewHeight = 0;
let lastFrame = 0;

function randomAt(x, y, salt = 0) {
	let value = Math.imul(x ^ salt, 0x45d9f3b);
	value = Math.imul(value ^ y, 0x45d9f3b);
	value ^= value >>> 16;
	return (value >>> 0) / 4294967295;
}

function getTile(x, y) {
	const roll = randomAt(x, y);
	const safeStart = Math.abs(x) < 6 && Math.abs(y) < 6;
	const trailY = Math.round(Math.sin(x * 0.13) * 3);
	if (y === trailY && randomAt(x, y, 19) > 0.12) return { type: "trail", roll };
	const biome = getBiome(x * tileSize, y * tileSize);
	if (!safeStart && roll > 0.79 && roll < 0.9) return { type: ["frost", "crystal"].includes(biome) ? "crystal" : ["ember", "desert"].includes(biome) ? "dead_tree" : "tree", roll, biome };
	if (roll > 0.96) return { type: ["frost", "crystal"].includes(biome) ? "crystal" : biome === "desert" ? "bones" : "rock", roll, biome };
	if (roll > 0.9) {
		const decorations = {
			forest: ["flower", "mushroom", "shrub"], highlands: ["flower", "rock", "shrub"],
			frost: ["crystal", "bones"], ember: ["cactus", "dead_tree"], storm: ["rock", "crystal"],
			marsh: ["mushroom", "flower", "shrub"], desert: ["cactus", "bones", "ruins"],
			crystal: ["crystal", "ruins", "shrub"], jungle: ["flower", "mushroom", "shrub"],
			coast: ["coral", "shell", "shrub"],
		};
		const choices = decorations[biome] || decorations.forest;
		return { type: choices[Math.floor(randomAt(x, y, 23) * choices.length)], roll, biome };
	}
	if (roll > 0.84) return { type: ["marsh", "jungle"].includes(biome) ? "mushroom" : biome === "desert" ? "cactus" : biome === "coast" ? "shell" : "flower", roll, biome };
	return { type: "grass", roll, biome };
}

function getBiome(x, y) {
	const warpX = x + Math.sin(y * 0.0016) * 260 + Math.sin((x + y) * 0.0007) * 190;
	const warpY = y + Math.sin(x * 0.0014) * 270 + Math.sin((y - x) * 0.0008) * 160;
	const distance = Math.hypot(warpX, warpY);
	if (Math.hypot(x - 2600, y + 1700) < 1000) return "desert";
	if (Math.hypot(x + 3400, y - 2100) < 1050) return "crystal";
	if (Math.hypot(x - 4500 + Math.sin(y * 0.002) * 180, y - 2700) < 1300) return "jungle";
	if (Math.hypot(x - 1300, y + 2350 + Math.sin(x * 0.002) * 170) < 1200) return "coast";
	if (Math.hypot(x + 1800, y + 2100) < 900 || warpY < -1550) return "frost";
	if (warpX > 700 && warpX < 1550 && warpY > -650 && warpY < 650) return "marsh";
	if (distance < 1250) return "forest";
	if (warpX > 1750 && warpY > 900) return "storm";
	if (warpX > 1550) return "ember";
	if (warpY > 1750 || warpX < -1550) return "marsh";
	return "highlands";
}

function objectPosition(tileX, tileY) {
	return {
		x: tileX * tileSize + tileSize / 2 + (randomAt(tileX, tileY, 7) - 0.5) * 12,
		y: tileY * tileSize + tileSize / 2 + (randomAt(tileX, tileY, 11) - 0.5) * 12,
	};
}

function getStats() {
	const player = state.player;
	const equipment = Object.values(player.equipment).filter(Boolean).map((id) => items[id]);
	const bonus = (key) => equipment.reduce((total, item) => total + (item[key] || 0), 0);
	const attributes = Object.fromEntries(Object.keys(player.stats).map((key) => [key, player.stats[key] + bonus(key)]));
	const resistances = {};
	const elementalDamage = {};
	for (const item of equipment) {
		for (const [element, value] of Object.entries(item.resistances || {})) resistances[element] = Math.min(0.75, (resistances[element] || 0) + value);
		for (const [element, value] of Object.entries(item.elementalDamage || {})) elementalDamage[element] = (elementalDamage[element] || 0) + value;
	}
	const raceId = player.raceId || selection.raceId || "human";
	const classId = player.classId || selection.classId || "warrior";
	if (raceId === "draconian") {
		resistances.fire = Math.min(0.75, (resistances.fire || 0) + 0.15);
		elementalDamage.fire = (elementalDamage.fire || 0) + 0.1;
	}
	if (raceId === "merfolk") {
		resistances.water = Math.min(0.75, (resistances.water || 0) + 0.12);
		elementalDamage.water = (elementalDamage.water || 0) + 0.12;
	}
	if (raceId === "tiefling") resistances.fire = Math.min(0.75, (resistances.fire || 0) + 0.2);
	if (raceId === "fairy") elementalDamage.arcane = (elementalDamage.arcane || 0) + 0.12;
	if (raceId === "tiefling") elementalDamage.dark = (elementalDamage.dark || 0) + 0.1;
	const night = state.dayTime % 300 >= 180;
	const isVampire = raceId === "vampire";
	return {
		attributes,
		resistances,
		elementalDamage,
		maxHp: 100 + attributes.vitality * 12 + bonus("hp") + (classId === "tank" ? 28 : 0),
		maxMp: 40 + attributes.intelligence * 8 + bonus("mp"),
		attack: 5 + attributes.strength * 3 + bonus("damage") + (raceId === "orc" ? 4 : 0) + (raceId === "beastkin" ? 2 : 0),
		bowAttack: (5 + attributes.agility * 2 + attributes.bowSkill * 4 + bonus("damage") + (raceId === "orc" ? 4 : 0) + (raceId === "beastkin" ? 2 : 0)) * (raceId === "elf" ? 1.2 : 1),
		magic: (8 + attributes.intelligence * 3 + attributes.magicPower * 4 + bonus("magic")) * (raceId === "elf" ? 1.25 : raceId === "fairy" ? 1.12 : 1),
		defense: Math.floor(attributes.vitality / 2) + bonus("defense") + (classId === "tank" ? 4 : 0) + (raceId === "dwarf" ? 3 : 0),
		speed: 185 + attributes.agility * 5 + (raceId === "halfling" ? 18 : 0) + (raceId === "goblin" ? 8 : 0) + (raceId === "beastkin" ? 12 : 0),
		ranged: Boolean(classes[classId]?.ranged),
		attackRange: classes[classId]?.ranged ? 560 : 72,
		damageTaken: isVampire ? (night ? 0.72 : 1.3) : 1,
		damageMultiplier: isVampire ? (night ? 1.3 : 0.78) : 1,
		lifeSteal: isVampire ? (night ? 0.32 : 0.16) : 0,
		night,
	};
}

function canEquip(item) {
	return Boolean(item?.slot && (!item.classes || item.classes.includes(state.player.classId)));
}

function displayName(definition, appearance = state.player.appearance) {
	return appearance === "boy" && definition.maleName ? definition.maleName : definition.name;
}

function saveProgress() {
	try {
		const player = state.player;
		const position = state.scene === "world" ? { x: player.x, y: player.y } : state.returnPosition;
		localStorage.setItem(saveKey, JSON.stringify({
			name: player.name, raceId: player.raceId, classId: player.classId, element: player.element,
			appearance: player.appearance,
			level: player.level, xp: player.xp, nextXp: player.nextXp, hp: player.hp, mp: player.mp,
			coins: player.coins, stats: player.stats, statPoints: player.statPoints,
			skillPoints: player.skillPoints, inventory: player.inventory, equipment: player.equipment,
			skills: state.skills, equippedSkills: state.equippedSkills, quests: state.quests, position, dayTime: state.dayTime, facing: player.facing,
		}));
	} catch {
		showToast("Não foi possível salvar neste navegador.");
	}
}

function loadProgress() {
	try {
		const saved = JSON.parse(localStorage.getItem(saveKey));
		if (!saved || !Number.isInteger(saved.level) || saved.level < 1 || !races[saved.raceId] || !classes[saved.classId]) return false;
		const player = state.player;
		player.raceId = saved.raceId; player.classId = saved.classId;
		player.element = player.classId === "mage" && isElementAvailableForRace(saved.element, player.raceId) ? saved.element : player.classId === "mage" ? "fire" : null;
		player.name = String(saved.name || "Viajante").slice(0, 18);
		player.appearance = saved.appearance === "boy" ? "boy" : "girl";
		player.level = Math.min(saved.level, 99);
		player.xp = Math.max(0, Number(saved.xp) || 0);
		player.nextXp = Math.max(45, Number(saved.nextXp) || 45);
		player.coins = Math.max(0, Number(saved.coins) || 0);
		player.statPoints = Math.max(0, Number(saved.statPoints) || 0);
		player.skillPoints = Math.max(0, Number(saved.skillPoints) || 0);
		player.stats = { ...classes[player.classId].stats };
		for (const key of Object.keys(player.stats)) player.stats[key] = Math.max(1, Number(saved.stats?.[key]) || player.stats[key]);
		player.inventory = Array.isArray(saved.inventory) ? saved.inventory.map((id) => id === "lucky_charm" ? "scholar_robe" : id).filter((id) => items[id]).slice(0, 100) : player.inventory;
		if (saved.equipment?.charm === "lucky_charm") player.inventory.push("scholar_robe");
		player.equipment = createEquipment();
		for (const id of Object.values(saved.equipment || {})) {
			const item = items[id];
			const slot = getEquipmentSlot(item);
			if (slot && equipmentSlotKeys.includes(slot) && canEquip(item) && !player.equipment[slot]) player.equipment[slot] = id;
		}
		if (!player.equipment.weapon) player.equipment.weapon = classes[player.classId].weapon;
		if (player.classId === "tank" && !player.equipment.shield) player.equipment.shield = "tower_shield";
		const availableSkills = availableSkillIds(player.classId);
		const migrateSkill = (id) => player.classId === "mage" ? legacyMageSkills[id] || id : id;
		state.skills = Array.isArray(saved.skills) ? [...new Set(saved.skills.map(migrateSkill).filter((id) => availableSkills.includes(id) && player.level >= skillInfo[id]?.level))] : [];
		if (!state.skills.length) state.skills = [availableSkills[0]];
		state.equippedSkills = Array.isArray(saved.equippedSkills)
			? [...new Set(saved.equippedSkills.map(migrateSkill).filter((id) => state.skills.includes(id)))].slice(0, 5)
			: state.skills.slice(0, 5);
		if (!state.equippedSkills.length) state.equippedSkills = state.skills.slice(0, 5);
		if (!["up", "down", "left", "right"].includes(saved.facing)) player.facing = "down";
		else player.facing = saved.facing;
		state.quests = { kills: Math.max(0, Number(saved.quests?.kills) || 0), bosses: Math.max(0, Number(saved.quests?.bosses) || 0) };
		state.dayTime = Math.max(0, Number(saved.dayTime) || 0);
		if (Number.isFinite(saved.position?.x) && Number.isFinite(saved.position?.y)) {
			player.x = saved.position.x; player.y = saved.position.y;
		}
		player.hp = Math.min(getStats().maxHp, Math.max(1, Number(saved.hp) || getStats().maxHp));
		player.mp = Math.min(getStats().maxMp, Math.max(0, Number(saved.mp) || 0));
		state.started = true;
		return true;
	} catch {
		try { localStorage.removeItem(saveKey); } catch { /* armazenamento indisponível */ }
		return false;
	}
}

function beginAdventure() {
	if (!selection.raceId || !selection.classId || (selection.classId === "mage" && !isElementAvailableForRace(selection.element, selection.raceId))) return;
	const player = state.player;
	const classData = classes[selection.classId];
	player.name = document.querySelector("#hero-name").value.trim().slice(0, 18) || "Viajante";
	player.raceId = selection.raceId; player.classId = selection.classId; player.element = selection.classId === "mage" ? selection.element : null;
	player.appearance = selection.appearance;
	player.level = 1; player.xp = 0; player.nextXp = 45; player.coins = 35; player.stats = { ...classData.stats };
	player.statPoints = 0; player.skillPoints = 0; player.inventory = ["minor_potion", "minor_potion", "slime_gel"];
	player.equipment = createEquipment();
	player.equipment.weapon = classData.weapon;
	player.equipment.armor = "travel_cloak";
	if (player.classId === "tank") player.equipment.shield = "tower_shield";
	player.status = [];
	player.x = 0; player.y = 0; player.hp = getStats().maxHp; player.mp = getStats().maxMp;
	const availableSkills = availableSkillIds(player.classId);
	const startingSkills = [availableSkills[0], races[player.raceId].skill];
	state.skills = startingSkills.filter((id) => availableSkills.includes(id));
	state.equippedSkills = [...state.skills];
	player.facing = "down";
	state.cooldowns = {}; state.enemies = []; state.drops = []; state.floating = []; state.attacks = []; state.projectiles = [];
	state.scene = "world"; state.started = true; state.dayTime = 0; state.quests = { kills: 0, bosses: 0 };
	document.querySelector("#creation-screen").hidden = true;
	saveProgress(); renderHud(); showToast(`${displayName(races[player.raceId])} ${displayName(classes[player.classId])}: sua aventura começa!`);
}

function updateCreation() {
	for (const button of document.querySelectorAll("[data-race]")) {
		button.setAttribute("aria-pressed", String(button.dataset.race === selection.raceId));
		button.querySelector("strong").textContent = displayName(races[button.dataset.race], selection.appearance);
	}
	for (const button of document.querySelectorAll("[data-class]")) {
		button.setAttribute("aria-pressed", String(button.dataset.class === selection.classId));
		button.querySelector("strong").textContent = displayName(classes[button.dataset.class], selection.appearance);
	}
	document.querySelector("#element-section").hidden = selection.classId !== "mage";
	if (!isElementAvailableForRace(selection.element, selection.raceId)) selection.element = null;
	for (const button of document.querySelectorAll("[data-element]")) {
		const vampireElement = ["dark", "blood"].includes(button.dataset.element);
		button.hidden = vampireElement && selection.raceId !== "vampire";
		button.setAttribute("aria-pressed", String(button.dataset.element === selection.element));
	}
	for (const button of document.querySelectorAll("[data-appearance]")) button.setAttribute("aria-pressed", String(button.dataset.appearance === selection.appearance));
	const race = races[selection.raceId]; const chosenClass = classes[selection.classId];
	document.querySelector("#creation-summary").textContent = race && chosenClass ? `${displayName(race)} · ${displayName(chosenClass)}` : "Escolha uma raça e uma classe";
	const element = mageElements[selection.element];
	document.querySelector("#creation-details").textContent = race && chosenClass ? `${race.passive} ${chosenClass.ranged ? "Ataques de longo alcance." : "Combate corpo a corpo."}${selection.classId === "mage" && element ? ` Elemento: ${element.name}.` : ""} Aparência: ${selection.appearance === "girl" ? "garota" : "garoto"}.` : `Aparência: ${selection.appearance === "girl" ? "garota" : "garoto"}`;
	document.querySelector("#begin-adventure").disabled = !race || !chosenClass || (selection.classId === "mage" && !isElementAvailableForRace(selection.element, selection.raceId));
	drawPreview();
}

function drawPreview() {
	const preview = document.querySelector("#character-preview");
	const previewContext = preview.getContext("2d");
	previewContext.clearRect(0, 0, preview.width, preview.height);
	const classId = selection.classId || "warrior";
	const previewEquipment = createEquipment();
	previewEquipment.weapon = classes[classId].weapon;
	previewEquipment.armor = "travel_cloak";
	if (classId === "tank") previewEquipment.shield = "tower_shield";
	drawHero(previewContext, 60, 108, 1.8, selection.appearance, selection.raceId || "human", classId, "travel_cloak", "down", null, previewEquipment.shield, previewEquipment);
}

function resizeCanvas() {
	const bounds = canvas.getBoundingClientRect();
	const ratio = Math.min(window.devicePixelRatio || 1, 2);
	viewWidth = bounds.width;
	viewHeight = bounds.height;
	canvas.width = Math.round(viewWidth * ratio);
	canvas.height = Math.round(viewHeight * ratio);
	context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawGround(tileX, tileY, screenX, screenY, tile) {
	if (tile.type === "trail") {
		context.fillStyle = tile.roll > 0.55 ? "#c6a66b" : "#b99a61";
		context.fillRect(screenX, screenY, tileSize + 1, tileSize + 1);
		context.fillStyle = "#d8bc82";
		context.fillRect(screenX + 8, screenY + 11, 2, 2);
		context.fillRect(screenX + 34, screenY + 31, 3, 2);
		return;
	}
	const palettes = {
		forest: ["#68b64e", "#70bd53", "#63ae48", "#6ab94d"],
		highlands: ["#8b9b66", "#99a36c", "#788d5e", "#a4a06c"],
		frost: ["#85b6bb", "#93c3c6", "#769fa9", "#a1c9ca"],
		ember: ["#b77a4b", "#c48955", "#a96c45", "#c18a5a"],
		storm: ["#657c80", "#71878a", "#5a7378", "#788b8d"],
		marsh: ["#6e9661", "#78945b", "#63845a", "#81965f"],
		desert: ["#c9a15f", "#d4ad6c", "#b88e50", "#dfbd7d"],
		crystal: ["#7899ad", "#83a8b7", "#6989a0", "#9abac1"],
		jungle: ["#467d43", "#518a45", "#3e703a", "#5a934d"],
		coast: ["#c2b67d", "#d0c28a", "#b8aa72", "#d7c992"],
	};
	const ground = palettes[tile.biome || getBiome(tileX * tileSize, tileY * tileSize)];
	context.fillStyle = ground[Math.floor(tile.roll * ground.length)];
	context.fillRect(screenX, screenY, tileSize + 1, tileSize + 1);
	const groundTint = { frost: "rgb(234 255 255 / 22%)", ember: "rgb(83 39 22 / 20%)", desert: "rgb(255 224 155 / 18%)", crystal: "rgb(202 239 255 / 20%)" };
	context.fillStyle = groundTint[tile.biome] || "rgb(31 91 44 / 20%)";
	for (let mark = 0; mark < 3; mark += 1) {
		context.fillRect(screenX + 5 + randomAt(tileX, tileY, mark + 31) * 38, screenY + 5 + randomAt(tileX, tileY, mark + 47) * 38, 2, 4);
	}
}

function drawTree(x, y, roll, biome = "forest") {
	context.fillStyle = "rgb(32 67 34 / 22%)";
	context.beginPath(); context.ellipse(x + 2, y + 10, 22, 10, 0, 0, Math.PI * 2); context.fill();
	context.fillStyle = "#81552e"; context.fillRect(x - 5, y - 2, 10, 25);
	context.fillStyle = "#a7743c"; context.fillRect(x - 2, y + 1, 3, 18);
	const treeColors = {
		forest: roll > 0.91 ? ["#27683d", "#38854a"] : ["#337a42", "#428d4a"],
		highlands: ["#647348", "#89965a"], frost: ["#547d86", "#8ab7b4"],
		ember: ["#70513b", "#9d7044"], storm: ["#435f63", "#6d8584"], marsh: ["#3c6846", "#638253"],
		jungle: ["#245f37", "#398044"],
	};
	const [darkCanopy, lightCanopy] = treeColors[biome] || treeColors.forest;
	context.fillStyle = darkCanopy;
	context.beginPath(); context.arc(x, y - 9, 20, 0, Math.PI * 2); context.fill();
	context.fillStyle = lightCanopy;
	context.beginPath(); context.arc(x - 8, y - 13, 11, 0, Math.PI * 2); context.arc(x + 8, y - 15, 11, 0, Math.PI * 2); context.arc(x, y - 21, 10, 0, Math.PI * 2); context.fill();
	context.fillStyle = "rgb(177 218 91 / 55%)"; context.fillRect(x - 7, y - 25, 4, 3); context.fillRect(x + 7, y - 17, 3, 3);
}

function drawRock(x, y) {
	context.fillStyle = "rgb(32 67 34 / 22%)";
	context.beginPath(); context.ellipse(x + 2, y + 5, 11, 6, 0, 0, Math.PI * 2); context.fill();
	context.fillStyle = "#929b80";
	context.beginPath(); context.moveTo(x - 10, y + 3); context.lineTo(x - 7, y - 5); context.lineTo(x + 1, y - 9); context.lineTo(x + 9, y - 4); context.lineTo(x + 11, y + 3); context.closePath(); context.fill();
	context.fillStyle = "#c0c5a5"; context.fillRect(x - 5, y - 4, 4, 2);
}

function drawFlower(x, y, roll) {
	const colors = ["#f0d95d", "#f4f0dc", "#e67a62", "#d88ac2"];
	context.fillStyle = "#397944"; context.fillRect(x - 1, y - 2, 2, 9);
	context.fillStyle = colors[Math.floor(roll * colors.length)];
	context.fillRect(x - 3, y - 5, 3, 3); context.fillRect(x + 1, y - 5, 3, 3); context.fillRect(x - 1, y - 7, 3, 3); context.fillRect(x - 1, y - 3, 3, 3);
	context.fillStyle = "#f6df78"; context.fillRect(x, y - 4, 2, 2);
}

function drawBiomeDecoration(x, y, type, biome, roll) {
	if (type === "mushroom") {
		context.fillStyle = "#55713e"; context.fillRect(x - 2, y - 1, 4, 8);
		context.fillStyle = roll > 0.5 ? "#c56b54" : "#d4bd73";
		context.beginPath(); context.ellipse(x, y - 2, 7, 4, 0, Math.PI, Math.PI * 2); context.fill();
		return;
	}
	if (type === "cactus") {
		context.fillStyle = "#667b45"; context.fillRect(x - 4, y - 12, 8, 24);
		context.fillRect(x - 10, y - 7, 6, 4); context.fillRect(x - 10, y - 10, 3, 7);
		context.fillRect(x + 4, y - 2, 6, 4); context.fillRect(x + 7, y - 5, 3, 7);
		return;
	}
	if (type === "crystal") {
		context.fillStyle = "#628e9b"; context.beginPath(); context.moveTo(x, y - 15); context.lineTo(x + 9, y + 3); context.lineTo(x - 8, y + 3); context.closePath(); context.fill();
		context.fillStyle = "#c8f2ee"; context.beginPath(); context.moveTo(x, y - 12); context.lineTo(x + 1, y); context.lineTo(x - 5, y + 1); context.closePath(); context.fill();
		return;
	}
	if (type === "dead_tree") {
		context.strokeStyle = biome === "ember" ? "#735039" : "#64706d"; context.lineWidth = 5;
		context.beginPath(); context.moveTo(x, y + 12); context.lineTo(x, y - 12); context.lineTo(x - 8, y - 19); context.moveTo(x, y - 5); context.lineTo(x + 9, y - 15); context.stroke();
		return;
	}
	if (type === "shrub") {
		context.fillStyle = biome === "marsh" ? "#416c48" : "#587b45";
		context.beginPath(); context.arc(x - 5, y, 6, 0, Math.PI * 2); context.arc(x + 3, y - 2, 8, 0, Math.PI * 2); context.arc(x + 8, y + 1, 5, 0, Math.PI * 2); context.fill();
		context.fillStyle = "#b8c76b"; context.fillRect(x - 3, y - 4, 3, 2); context.fillRect(x + 5, y - 5, 2, 2);
		return;
	}
	if (type === "bones") {
		context.strokeStyle = "#e3d8b8"; context.lineWidth = 4;
		context.beginPath(); context.moveTo(x - 8, y - 4); context.lineTo(x + 8, y + 4); context.moveTo(x + 7, y - 8); context.lineTo(x - 7, y + 8); context.stroke();
		return;
	}
	if (type === "ruins") {
		context.fillStyle = "#8b8068"; context.fillRect(x - 10, y - 12, 7, 24); context.fillRect(x + 4, y - 8, 7, 20);
		context.fillStyle = "#b2a488"; context.fillRect(x - 13, y - 15, 13, 4); context.fillRect(x + 2, y - 11, 12, 4);
		return;
	}
	if (type === "coral") {
		context.strokeStyle = "#d47e72"; context.lineWidth = 4;
		context.beginPath(); context.moveTo(x, y + 9); context.lineTo(x, y - 9); context.lineTo(x - 7, y - 15); context.moveTo(x, y - 3); context.lineTo(x + 8, y - 10); context.stroke();
		return;
	}
	if (type === "shell") {
		context.fillStyle = "#e7d2a0"; context.beginPath(); context.arc(x, y, 7, Math.PI, 0); context.lineTo(x + 7, y + 4); context.lineTo(x - 7, y + 4); context.closePath(); context.fill();
		context.strokeStyle = "#b58e71"; context.lineWidth = 1; context.beginPath(); context.moveTo(x, y - 6); context.lineTo(x, y + 3); context.moveTo(x - 4, y - 4); context.lineTo(x - 3, y + 3); context.moveTo(x + 4, y - 4); context.lineTo(x + 3, y + 3); context.stroke();
		return;
	}
	if (type === "flower") drawFlower(x, y, roll);
}

function drawShop(x, y, name, color, sign) {
	context.fillStyle = "rgb(32 67 34 / 25%)"; context.fillRect(x - 30, y + 16, 64, 10);
	context.fillStyle = "#e2c68b"; context.fillRect(x - 27, y - 13, 54, 30);
	context.fillStyle = color; context.fillRect(x - 33, y - 19, 66, 10);
	context.fillStyle = "#75482d"; context.fillRect(x - 6, y + 1, 13, 16);
	context.fillStyle = "#f2e7b6"; context.fillRect(x + 10, y - 8, 10, 9);
	context.fillStyle = "#17291d"; context.font = "bold 9px Trebuchet MS"; context.textAlign = "center"; context.fillText(sign, x, y - 25);
	context.fillStyle = "#18281c"; context.font = "bold 8px Trebuchet MS"; context.fillText(name, x, y + 30);
}

function drawPortal(x, y, open = true, label = "MASMORRA") {
	context.fillStyle = "#51462e"; context.fillRect(x - 34, y - 22, 68, 34);
	context.fillStyle = open ? "#172c34" : "#583c32"; context.fillRect(x - 25, y - 18, 50, 30);
	context.strokeStyle = "#c3a95f"; context.lineWidth = 4; context.strokeRect(x - 31, y - 22, 62, 36);
	context.fillStyle = open ? "#78bfd0" : "#d07c52"; context.fillRect(x - 3, y - 10, 6, 19);
	context.fillStyle = "#f0e2b0"; context.font = "bold 8px Trebuchet MS"; context.textAlign = "center"; context.fillText(label, x, y + 27);
}

function fillSoftShape(targetContext, points, color) {
	targetContext.fillStyle = color;
	targetContext.beginPath();
	targetContext.moveTo(points[0][0], points[0][1]);
	for (let index = 1; index < points.length; index += 1) targetContext.quadraticCurveTo(...points[index]);
	targetContext.closePath();
	targetContext.fill();
}

function drawHero(targetContext, x, y, scale, appearance, raceId, classId, armorId, facing = "down", helmetId = null, shieldId = null, equipment = {}) {
	const outfit = items[armorId]?.color || classes[classId]?.color || "#738a62";
	const hair = raceId === "vampire" ? "#382a35" : raceId === "elf" ? "#d8bd69" : raceId === "dwarf" ? "#8e4d32" : raceId === "draconian" || raceId === "tiefling" ? "#6e3930" : raceId === "merfolk" ? "#477f82" : raceId === "goblin" || raceId === "beastkin" ? "#3c5836" : "#60422f";
	const skin = raceId === "vampire" ? "#dfd2ca" : raceId === "elf" ? "#e9cda0" : raceId === "orc" ? "#88a66a" : raceId === "draconian" ? "#a66c55" : raceId === "merfolk" ? "#78a8ac" : raceId === "goblin" ? "#91a868" : "#d9aa7e";
	const accent = "#ead6a0";
	const bootColor = equipment.boots ? getItemColor(items[equipment.boots]) : "#514139";
	const gloveId = equipment.gloves1 || equipment.gloves2;
	const gloveColor = gloveId ? getItemColor(items[gloveId]) : skin;
	const weaponId = equipment.weapon;
	const weaponColor = getItemColor(items[weaponId]);

	targetContext.save();
	targetContext.translate(x, y);
	targetContext.scale(facing === "left" ? -scale : scale, scale);
	targetContext.fillStyle = "rgb(20 31 25 / 35%)";
	targetContext.beginPath(); targetContext.ellipse(0, 3, 11, 4, 0, 0, Math.PI * 2); targetContext.fill();

	if (raceId === "fairy") {
		targetContext.fillStyle = "rgb(202 235 220 / 65%)";
		targetContext.beginPath();
		targetContext.ellipse(-10, -24, 5, 11, -0.48, 0, Math.PI * 2);
		targetContext.ellipse(10, -24, 5, 11, 0.48, 0, Math.PI * 2);
		targetContext.fill();
		targetContext.strokeStyle = "rgb(239 255 227 / 72%)";
		targetContext.lineWidth = 1;
		targetContext.beginPath(); targetContext.moveTo(-13, -29); targetContext.lineTo(-8, -22); targetContext.moveTo(13, -29); targetContext.lineTo(8, -22); targetContext.stroke();
	}

	if (raceId === "vampire") {
		fillSoftShape(targetContext, [[-7, -26], [-16, -22, -15, -12], [-9, -4, 0, -7], [9, -4, 15, -12], [16, -22, 7, -26]], "#633f52");
		targetContext.fillStyle = "#8d5968"; targetContext.beginPath(); targetContext.moveTo(-9, -24); targetContext.lineTo(0, -14); targetContext.lineTo(9, -24); targetContext.fill();
	}

	const pantsColor = items[equipment.pants]?.color || "#455343";
	fillSoftShape(targetContext, [[-6, -18], [-8, -13, -7, -7], [-8, -2, -4, -1], [-1, -1, 0, -7], [2, -1, 7, -1], [9, -5, 7, -12], [6, -18, -6, -18]], pantsColor);
	fillSoftShape(targetContext, [[-7, -4], [-11, -4, -11, 0], [-9, 2, -2, 2], [0, 0, -2, -4]], bootColor);
	fillSoftShape(targetContext, [[2, -4], [0, 0, 2, 2], [9, 2, 12, 0], [12, -4, 8, -5]], bootColor);
	targetContext.strokeStyle = "rgb(244 228 177 / 35%)"; targetContext.lineWidth = 1;
	targetContext.beginPath(); targetContext.moveTo(-3, -14); targetContext.lineTo(-2, -7); targetContext.moveTo(3, -14); targetContext.lineTo(4, -7); targetContext.stroke();

	fillSoftShape(targetContext, [[-7, -28], [-11, -26, -11, -20], [-9, -11, -7, -10], [-3, -9, 0, -12], [3, -9, 8, -10], [11, -15, 9, -22], [8, -27, 6, -28]], outfit);
	fillSoftShape(targetContext, [[-8, -26], [-12, -23, -10, -17], [-6, -15, -2, -16], [0, -19, -1, -23]], outfit);
	fillSoftShape(targetContext, [[8, -26], [12, -23, 10, -17], [6, -15, 2, -16], [0, -19, 1, -23]], outfit);
	targetContext.fillStyle = accent;
	targetContext.beginPath(); targetContext.moveTo(0, -26); targetContext.lineTo(4, -22); targetContext.lineTo(0, -17); targetContext.lineTo(-4, -22); targetContext.closePath(); targetContext.fill();
	targetContext.strokeStyle = "rgb(255 246 216 / 44%)"; targetContext.lineWidth = 1;
	targetContext.beginPath(); targetContext.moveTo(-5, -25); targetContext.lineTo(-5, -14); targetContext.moveTo(5, -25); targetContext.lineTo(5, -14); targetContext.stroke();

	const beltColor = equipment.belt ? getItemColor(items[equipment.belt]) : "#735233";
	targetContext.strokeStyle = beltColor; targetContext.lineWidth = 3;
	targetContext.beginPath(); targetContext.moveTo(-7, -15); targetContext.quadraticCurveTo(0, -13, 7, -15); targetContext.stroke();
	targetContext.strokeStyle = accent; targetContext.lineWidth = 1.5;
	targetContext.beginPath(); targetContext.arc(0, -15, 1.5, 0, Math.PI * 2); targetContext.stroke();

	fillSoftShape(targetContext, [[-6, -37], [-11, -37, -11, -31], [-9, -27, -6, -27], [-2, -27, 0, -30], [2, -27, 7, -27], [11, -30, 10, -35], [9, -38, 6, -38]], skin);
	targetContext.fillStyle = skin;
	targetContext.beginPath(); targetContext.ellipse(0, -35, 7.3, 8.5, 0, 0, Math.PI * 2); targetContext.fill();
	targetContext.fillStyle = "rgb(255 233 207 / 28%)";
	targetContext.beginPath(); targetContext.ellipse(-2, -38, 3.2, 2.2, -0.4, 0, Math.PI * 2); targetContext.fill();

	if (raceId === "elf" || raceId === "goblin" || raceId === "beastkin" || raceId === "merfolk") {
		targetContext.fillStyle = raceId === "merfolk" ? "#609b9d" : skin;
		const earLength = raceId === "elf" ? 9 : 7;
		targetContext.beginPath();
		targetContext.moveTo(-6, -37); targetContext.quadraticCurveTo(-10, -39, -7 - earLength, -39 - earLength / 3); targetContext.quadraticCurveTo(-8, -32, -5, -32);
		targetContext.moveTo(6, -37); targetContext.quadraticCurveTo(10, -39, 7 + earLength, -39 - earLength / 3); targetContext.quadraticCurveTo(8, -32, 5, -32);
		targetContext.fill();
	}

	if (raceId === "orc") {
		targetContext.fillStyle = "#eee2c4";
		targetContext.beginPath(); targetContext.moveTo(-5, -30); targetContext.lineTo(-3, -24); targetContext.lineTo(-1, -29); targetContext.fill();
		targetContext.beginPath(); targetContext.moveTo(5, -30); targetContext.lineTo(3, -24); targetContext.lineTo(1, -29); targetContext.fill();
	}
	if (raceId === "draconian" || raceId === "tiefling") {
		const horn = raceId === "tiefling" ? "#443243" : "#74463c";
		fillSoftShape(targetContext, [[-5, -40], [-11, -44, -10, -49], [-7, -46, -3, -41]], horn);
		fillSoftShape(targetContext, [[5, -40], [11, -44, 10, -49], [7, -46, 3, -41]], horn);
		targetContext.fillStyle = "rgb(255 218 150 / 24%)";
		targetContext.beginPath(); targetContext.arc(-3, -31, 1, 0, Math.PI * 2); targetContext.arc(4, -31, 1, 0, Math.PI * 2); targetContext.fill();
	}
	if (raceId === "merfolk") {
		targetContext.fillStyle = "#77b8b2";
		targetContext.beginPath(); targetContext.moveTo(-8, -14); targetContext.lineTo(-13, -20); targetContext.lineTo(-12, -10); targetContext.closePath();
		targetContext.moveTo(8, -14); targetContext.lineTo(13, -20); targetContext.lineTo(12, -10); targetContext.closePath(); targetContext.fill();
	}
	if (raceId === "gnome") {
		targetContext.fillStyle = "#eee6d4";
		fillSoftShape(targetContext, [[-5, -29], [-7, -24, -4, -22], [0, -22, 0, -25], [2, -22, 6, -24], [7, -28, 5, -29]], "#eee6d4");
	}

	targetContext.fillStyle = hair;
	targetContext.beginPath(); targetContext.ellipse(0, -40, 7.5, 4.4, 0, Math.PI, Math.PI * 2); targetContext.fill();
	fillSoftShape(targetContext, [[-7, -40], [-10, -37, -8, -33], [-7, -30, -5, -31]], hair);
	fillSoftShape(targetContext, [[5, -40], [9, -38, 8, -34], [appearance === "girl" ? 10 : 7, -27, 4, -28]], hair);
	if (appearance === "girl") fillSoftShape(targetContext, [[-6, -36], [-9, -33, -8, -27], [-6, -25, -5, -29]], hair);
	if (facing === "up") {
		targetContext.fillStyle = hair;
		targetContext.beginPath(); targetContext.ellipse(0, -35, 7.4, 7.6, 0, Math.PI, Math.PI * 2); targetContext.fill();
	} else {
		targetContext.fillStyle = raceId === "vampire" ? "#9d283e" : "#3c302b";
		targetContext.beginPath();
		if (facing === "down") {
			targetContext.ellipse(-2.6, -35, 0.8, 1.1, 0, 0, Math.PI * 2);
			targetContext.ellipse(2.6, -35, 0.8, 1.1, 0, 0, Math.PI * 2);
		} else targetContext.ellipse(3.2, -35, 0.8, 1.1, 0, 0, Math.PI * 2);
		targetContext.fill();
		targetContext.strokeStyle = "rgb(104 54 48 / 55%)"; targetContext.lineWidth = 0.8;
		targetContext.beginPath(); targetContext.moveTo(-3, -37); targetContext.lineTo(-1.5, -37); targetContext.moveTo(1.5, -37); targetContext.lineTo(3, -37); targetContext.stroke();
	}

	if (equipment.necklace || equipment.charm) {
		const gemColor = items[equipment.necklace || equipment.charm]?.color || accent;
		targetContext.strokeStyle = gemColor; targetContext.lineWidth = 1.3;
		targetContext.beginPath(); targetContext.moveTo(-3, -28); targetContext.quadraticCurveTo(0, -23, 3, -28); targetContext.stroke();
		targetContext.fillStyle = gemColor; targetContext.beginPath(); targetContext.arc(0, -24, 1.7, 0, Math.PI * 2); targetContext.fill();
	}
	for (const slot of ["bracelet1", "bracelet2"]) {
		if (!equipment[slot]) continue;
		targetContext.fillStyle = items[equipment[slot]]?.color || accent;
		targetContext.beginPath(); targetContext.arc(slot === "bracelet1" ? -8 : 8, -17, 1.8, 0, Math.PI * 2); targetContext.fill();
	}

	if (helmetId) {
		const helmetColor = getItemColor(items[helmetId]);
		targetContext.fillStyle = helmetColor;
		if (helmetId === "arcane_hat") {
			fillSoftShape(targetContext, [[-9, -39], [-11, -44, -8, -46], [-2, -43, 0, -51], [2, -43, 9, -45], [12, -42, 9, -39]], helmetColor);
			targetContext.fillStyle = accent; targetContext.beginPath(); targetContext.arc(0, -45, 1.5, 0, Math.PI * 2); targetContext.fill();
		} else {
			fillSoftShape(targetContext, [[-9, -38], [-9, -47, -3, -47], [0, -49, 3, -47], [10, -45, 9, -37]], helmetColor);
			targetContext.strokeStyle = accent; targetContext.lineWidth = 1;
			targetContext.beginPath(); targetContext.moveTo(-7, -39); targetContext.quadraticCurveTo(0, -41, 7, -39); targetContext.stroke();
		}
	}

	if (shieldId) {
		const shieldColor = getItemColor(items[shieldId]);
		targetContext.fillStyle = shieldColor;
		targetContext.beginPath(); targetContext.moveTo(-9, -24); targetContext.quadraticCurveTo(-17, -26, -17, -21); targetContext.lineTo(-16, -12); targetContext.quadraticCurveTo(-15, -8, -10, -5); targetContext.quadraticCurveTo(-6, -9, -6, -13); targetContext.lineTo(-6, -21); targetContext.closePath(); targetContext.fill();
		targetContext.strokeStyle = accent; targetContext.lineWidth = 1.1;
		targetContext.beginPath(); targetContext.moveTo(-12, -22); targetContext.lineTo(-12, -9); targetContext.stroke();
	}

	targetContext.fillStyle = gloveColor;
	targetContext.beginPath(); targetContext.arc(-8, -16, 2.2, 0, Math.PI * 2); targetContext.arc(8, -16, 2.2, 0, Math.PI * 2); targetContext.fill();
	targetContext.strokeStyle = "rgb(255 240 203 / 35%)"; targetContext.lineWidth = 0.8;
	targetContext.beginPath(); targetContext.moveTo(-8, -23); targetContext.lineTo(-9, -19); targetContext.moveTo(8, -23); targetContext.lineTo(9, -19); targetContext.stroke();

	if (weaponId) {
		targetContext.save();
		targetContext.translate(11, -18);
		targetContext.rotate(0.25);
		if (/bow|arco/i.test(weaponId)) {
			targetContext.strokeStyle = weaponColor; targetContext.lineWidth = 1.7;
			targetContext.beginPath(); targetContext.arc(0, 0, 8, -Math.PI / 2, Math.PI / 2); targetContext.stroke();
			targetContext.strokeStyle = accent; targetContext.lineWidth = 0.7;
			targetContext.beginPath(); targetContext.moveTo(0, -8); targetContext.lineTo(0, 8); targetContext.stroke();
		} else if (/staff|cajado|cetro|bast[aã]o|lyre|lute/i.test(`${weaponId} ${items[weaponId]?.name || ""}`)) {
			targetContext.strokeStyle = "#795638"; targetContext.lineWidth = 2.3;
			targetContext.beginPath(); targetContext.moveTo(-1, 9); targetContext.lineTo(2, -11); targetContext.stroke();
			targetContext.fillStyle = weaponColor; targetContext.beginPath(); targetContext.arc(2, -12, 3, 0, Math.PI * 2); targetContext.fill();
			targetContext.fillStyle = "#fff2be"; targetContext.beginPath(); targetContext.arc(2, -12, 1, 0, Math.PI * 2); targetContext.fill();
		} else {
			targetContext.strokeStyle = "#795638"; targetContext.lineWidth = 2;
			targetContext.beginPath(); targetContext.moveTo(0, 8); targetContext.lineTo(1, 2); targetContext.stroke();
			targetContext.fillStyle = weaponColor;
			targetContext.beginPath(); targetContext.moveTo(0, 2); targetContext.lineTo(-2, -8); targetContext.lineTo(1, -14); targetContext.lineTo(4, -8); targetContext.lineTo(2, 2); targetContext.closePath(); targetContext.fill();
			targetContext.strokeStyle = accent; targetContext.lineWidth = 1.2;
			targetContext.beginPath(); targetContext.moveTo(-3, 2); targetContext.lineTo(5, 2); targetContext.stroke();
		}
		targetContext.restore();
	}
	targetContext.restore();
}

function drawPlayer(x, y) {
	const moving = keys.size > 0 || Math.hypot(joystickAxes.x, joystickAxes.y) > 0.1;
	const bob = moving ? Math.sin(state.dayTime * 16) * 1.5 : 0;
	drawHero(context, x, y + bob, 1, state.player.appearance, state.player.raceId, state.player.classId, state.player.equipment.armor, state.player.facing, state.player.equipment.helmet, state.player.equipment.shield, state.player.equipment);
}

function drawEnemy(enemy, cameraX, cameraY) {
	const x = enemy.x - cameraX;
	const y = enemy.y - cameraY;
	const size = enemy.boss ? 36 : 22;
	context.fillStyle = "rgb(26 39 25 / 25%)"; context.fillRect(x - size / 2, y + size / 2 - 1, size, 6);
	context.fillStyle = enemy.color;
	if (enemy.type === "skeleton" || enemy.type === "ice_wraith" || enemy.type === "cultist") {
		context.fillRect(x - 10, y - 11, 20, 20); context.fillStyle = enemy.type === "ice_wraith" ? "#d9f5ef" : enemy.type === "cultist" ? "#b198c0" : "#f3e7c7"; context.fillRect(x - 7, y - 14, 14, 12);
	} else if (enemy.type === "bat") {
		context.beginPath(); context.moveTo(x, y - 7); context.lineTo(x - 18, y - 13); context.lineTo(x - 12, y + 5); context.lineTo(x, y + 9); context.lineTo(x + 12, y + 5); context.lineTo(x + 18, y - 13); context.closePath(); context.fill();
	} else if (enemy.type === "wolf" || enemy.type === "ember_drake") {
		context.beginPath(); context.moveTo(x - 15, y + 7); context.lineTo(x - 12, y - 7); context.lineTo(x - 3, y - 14); context.lineTo(x + 5, y - 8); context.lineTo(x + 15, y - 11); context.lineTo(x + 10, y + 8); context.closePath(); context.fill();
	} else if (enemy.type === "spider") {
		for (const side of [-1, 1]) {
			for (let leg = 0; leg < 3; leg += 1) {
				context.beginPath(); context.moveTo(x + side * 4, y + leg * 4 - 5); context.lineTo(x + side * (13 + leg * 2), y + leg * 7 - 8); context.strokeStyle = enemy.color; context.lineWidth = 3; context.stroke();
			}
		}
		context.beginPath(); context.arc(x, y, 10, 0, Math.PI * 2); context.fill();
	} else if (enemy.type === "stone_golem") {
		context.fillRect(x - 13, y - 13, 26, 26); context.fillStyle = "#d8c99e"; context.fillRect(x - 7, y - 8, 4, 4); context.fillRect(x + 3, y - 8, 4, 4);
	} else {
		context.beginPath(); context.arc(x, y, size / 2, 0, Math.PI * 2); context.fill();
	}
	context.fillStyle = enemy.boss ? "#f0dfab" : "#f8f2d4";
	context.fillRect(x - 6, y - 4, 3, 3); context.fillRect(x + 3, y - 4, 3, 3);
	const barWidth = enemy.boss ? 45 : 28;
	context.fillStyle = "#362e2a"; context.fillRect(x - barWidth / 2, y - size / 2 - 9, barWidth, 4);
	context.fillStyle = enemy.boss ? "#e2a33e" : "#d44e43";
	context.fillRect(x - barWidth / 2, y - size / 2 - 9, barWidth * Math.max(0, enemy.hp / enemy.maxHp), 4);
	context.fillStyle = "#f8f2d4"; context.font = "bold 7px Trebuchet MS"; context.textAlign = "center";
	context.fillText(`${enemy.name} · NV.${enemy.level}`, x, y - size / 2 - 12);
}

function drawDrop(drop, cameraX, cameraY) {
	const x = drop.x - cameraX;
	const y = drop.y - cameraY;
	const color = drop.kind === "coins" ? "#f4d15b" : getItemColor(items[drop.item]);
	context.fillStyle = "rgb(28 43 23 / 30%)";
	context.beginPath(); context.ellipse(x, y + 4, 8, 3, 0, 0, Math.PI * 2); context.fill();
	context.save();
	context.shadowColor = color; context.shadowBlur = 10;
	context.fillStyle = color;
	context.beginPath();
	if (drop.kind === "coins") {
		context.arc(x, y - 1, 5, 0, Math.PI * 2);
	} else {
		context.moveTo(x, y - 8); context.lineTo(x + 6, y - 2); context.lineTo(x + 4, y + 5);
		context.lineTo(x - 4, y + 5); context.lineTo(x - 6, y - 2); context.closePath();
	}
	context.fill();
	context.restore();
	context.fillStyle = "rgb(255 250 220 / 82%)";
	context.beginPath(); context.arc(x - 1, y - 3, 1.4, 0, Math.PI * 2); context.fill();
}

function drawAttackEffects(cameraX, cameraY) {
	for (const attack of state.attacks) {
		const progress = 1 - attack.life / 0.22;
		context.globalAlpha = Math.max(0, attack.life / 0.22);
		context.strokeStyle = "#f5e49a"; context.lineWidth = 2;
		context.beginPath(); context.arc(attack.x - cameraX, attack.y - cameraY, 8 + progress * 24, 0, Math.PI * 2); context.stroke();
	}
	context.globalAlpha = 1;
}

function drawProjectiles(cameraX, cameraY) {
	const colors = { fire: "#ff914d", water: "#55bddd", ice: "#a9efff", lightning: "#f6e45e", earth: "#b49567", nature: "#8ed86c", arcane: "#c69aff", dark: "#8b69b5", blood: "#d84e69", radiant: "#fff0a1", poison: "#a6db62" };
	for (const projectile of state.projectiles) {
		const x = projectile.x - cameraX;
		const y = projectile.y - cameraY;
		const angle = Math.atan2(projectile.target.y - projectile.y, projectile.target.x - projectile.x);
		context.save();
		context.translate(x, y);
		context.rotate(angle);
		if (projectile.kind === "arrow") {
			context.strokeStyle = "#e7d4a0"; context.lineWidth = 2;
			context.beginPath(); context.moveTo(-12, 0); context.lineTo(5, 0); context.stroke();
			context.fillStyle = "#f4ead1"; context.beginPath(); context.moveTo(9, 0); context.lineTo(3, -3); context.lineTo(3, 3); context.closePath(); context.fill();
		} else {
			const color = colors[projectile.damageType] || "#ded0ff";
			context.globalAlpha = 0.45; context.fillStyle = color; context.beginPath(); context.arc(0, 0, 9, 0, Math.PI * 2); context.fill();
			context.globalAlpha = 1; context.fillStyle = "#fff6d8"; context.beginPath(); context.arc(0, 0, 4, 0, Math.PI * 2); context.fill();
		}
		context.restore();
	}
}

function drawAtmosphere() {
	if (state.scene === "world") {
		const time = state.dayTime % 300;
		const fade = (progress) => progress * progress * (3 - 2 * progress);
		let night = 0;
		if (time >= 150 && time < 210) night = fade((time - 150) / 60);
		else if (time >= 210 && time < 270) night = 1;
		else if (time >= 270) night = 1 - fade((time - 270) / 30);
		if (night > 0) {
			context.fillStyle = `rgba(18, 24, 53, ${night * 0.25})`;
			context.fillRect(0, 0, viewWidth, viewHeight);
		}
	}

	const radius = Math.max(viewWidth, viewHeight) * (state.scene === "dungeon" ? 0.54 : 0.78);
	const light = context.createRadialGradient(viewWidth / 2, viewHeight / 2, radius * 0.12, viewWidth / 2, viewHeight / 2, radius);
	light.addColorStop(0, "rgba(12, 19, 17, 0)");
	light.addColorStop(0.65, "rgba(12, 19, 17, 0.035)");
	light.addColorStop(1, `rgba(12, 19, 17, ${state.scene === "dungeon" ? 0.46 : 0.25})`);
	context.fillStyle = light;
	context.fillRect(0, 0, viewWidth, viewHeight);
}

function drawWorld() {
	const player = state.player;
	const cameraX = player.x - viewWidth / 2;
	const cameraY = player.y - viewHeight / 2;
	const firstX = Math.floor(cameraX / tileSize) - 1;
	const firstY = Math.floor(cameraY / tileSize) - 1;
	const lastX = Math.ceil((cameraX + viewWidth) / tileSize) + 1;
	const lastY = Math.ceil((cameraY + viewHeight) / tileSize) + 1;
	const objects = [];
	context.clearRect(0, 0, viewWidth, viewHeight);
	for (let tileY = firstY; tileY <= lastY; tileY += 1) {
		for (let tileX = firstX; tileX <= lastX; tileX += 1) {
			const screenX = tileX * tileSize - cameraX;
			const screenY = tileY * tileSize - cameraY;
			const tile = getTile(tileX, tileY);
			drawGround(tileX, tileY, screenX, screenY, tile);
			if (tile.type !== "grass" && tile.type !== "trail") objects.push({ ...objectPosition(tileX, tileY), type: tile.type, biome: tile.biome, roll: tile.roll });
		}
	}
	objects.sort((a, b) => a.y - b.y);
	for (const object of objects) {
		const x = object.x - cameraX;
		const y = object.y - cameraY;
		if (object.type === "tree") drawTree(x, y, object.roll, object.biome);
		if (object.type === "rock") drawRock(x, y);
		if (object.type !== "tree" && object.type !== "rock") drawBiomeDecoration(x, y, object.type, object.biome, object.roll);
	}
	drawShop(-145 - cameraX, -5 - cameraY, "COMPRADOR", "#6d93a0", "VENDER");
	drawShop(145 - cameraX, -5 - cameraY, "MERCADOR", "#b36a4c", "COMPRAR");
	drawShop(0 - cameraX, 155 - cameraY, "FORJA", "#7d6a53", "CRIAR");
	for (const dungeon of Object.values(dungeons)) {
		drawPortal(dungeon.x - cameraX, dungeon.y - cameraY, true, dungeon.label);
	}
	for (const drop of state.drops) if (drop.scene !== "dungeon") drawDrop(drop, cameraX, cameraY);
	for (const enemy of state.enemies) if (!enemy.dead) drawEnemy(enemy, cameraX, cameraY);
	for (const text of state.floating) {
		context.globalAlpha = Math.max(0, text.life / 0.8);
		context.fillStyle = text.color; context.font = "bold 12px Trebuchet MS"; context.textAlign = "center";
		context.fillText(text.text, text.x - cameraX, text.y - cameraY - (0.8 - text.life) * 22);
	}
	context.globalAlpha = 1;
	drawAttackEffects(cameraX, cameraY);
	drawProjectiles(cameraX, cameraY);
	drawPlayer(viewWidth / 2, viewHeight / 2);
	drawAtmosphere();
}

function drawDungeon() {
	const player = state.player;
	const cameraX = player.x - viewWidth / 2;
	const cameraY = player.y - viewHeight / 2;
	const floorPalettes = [
		["#5b6052", "#555a4d"], ["#4f6870", "#465b62"], ["#704d3b", "#5f4032"],
		["#4a5578", "#3d4868"], ["#536f78", "#435b64"], ["#594958", "#46384d"],
	];
	const floorPalette = floorPalettes[dungeons[state.dungeonId].tier % floorPalettes.length];
	context.fillStyle = "#252b2a"; context.fillRect(0, 0, viewWidth, viewHeight);
	for (let y = -240; y <= 192; y += 48) {
		for (let x = -336; x <= 336; x += 48) {
			const sx = x - cameraX; const sy = y - cameraY;
			context.fillStyle = floorPalette[randomAt(x, y, state.room) > 0.5 ? 0 : 1];
			context.fillRect(sx, sy, 47, 47);
			context.strokeStyle = "rgb(24 30 28 / 30%)"; context.strokeRect(sx, sy, 47, 47);
		}
	}
	context.fillStyle = "#343a34";
	context.fillRect(-360 - cameraX, -252 - cameraY, 720, 22);
	context.fillRect(-360 - cameraX, 194 - cameraY, 720, 22);
	context.fillRect(-360 - cameraX, -230 - cameraY, 22, 424);
	context.fillRect(338 - cameraX, -230 - cameraY, 22, 424);
	context.fillStyle = state.enemies.length ? "#65443a" : "#a5ae65";
	context.fillRect(-25 - cameraX, -228 - cameraY, 50, 23);
	context.fillStyle = "#e8d9aa"; context.font = "bold 10px Trebuchet MS"; context.textAlign = "center";
	context.fillText(state.enemies.length
		? `${dungeons[state.dungeonId].name} · ANDAR ${state.room}/12`
		: state.room < 12 ? `ANDAR ${state.room} LIMPO · AVANCE` : "CHEFE DERROTADO · SAÍDA ABERTA", viewWidth / 2, 32);
	for (let candle = -1; candle <= 1; candle += 2) {
		context.fillStyle = "#85543a"; context.fillRect(candle * 290 - cameraX, -120 - cameraY, 8, 24);
		context.fillStyle = "#efc85a"; context.fillRect(candle * 290 - cameraX + 2, -126 - cameraY, 4, 8);
	}
	for (const drop of state.drops) if (drop.scene === "dungeon" && drop.dungeonId === state.dungeonId) drawDrop(drop, cameraX, cameraY);
	for (const enemy of state.enemies) if (!enemy.dead) drawEnemy(enemy, cameraX, cameraY);
	for (const text of state.floating) {
		context.globalAlpha = Math.max(0, text.life / 0.8); context.fillStyle = text.color; context.font = "bold 12px Trebuchet MS"; context.textAlign = "center";
		context.fillText(text.text, text.x - cameraX, text.y - cameraY - (0.8 - text.life) * 22);
	}
	context.globalAlpha = 1;
	drawAttackEffects(cameraX, cameraY);
	drawProjectiles(cameraX, cameraY);
	drawPlayer(viewWidth / 2, viewHeight / 2);
	drawAtmosphere();
}

function draw() {
	if (!viewWidth || !viewHeight) return;
	if (state.scene === "world") drawWorld();
	else drawDungeon();
}

const dungeons = {
	woodland: { name: "Catacumbas do Bosque", label: "BOSQUE", x: 0, y: -185, tier: 0, element: "nature", enemies: ["briarling", "moss_troll", "spider", "wolf"], boss: "boss", rewardArmor: "grove_armor", rewardWeapon: "grove_weapon", rewardCharm: "grove_charm", treasure: "mossbound_boots" },
	tide: { name: "Santuário das Marés", label: "MARÉS", x: 1100, y: 0, tier: 1, element: "water", enemies: ["water_wisp", "reef_guardian", "drowned", "tide_siren"], boss: "leviathan", rewardArmor: "tide_armor", rewardWeapon: "tide_weapon", rewardCharm: "tide_charm", treasure: "abyssal_bracers" },
	ember: { name: "Abismo das Brasas", label: "BRASAS", x: 2250, y: 850, tier: 2, element: "fire", enemies: ["ember_drake", "fire_imp", "magma_golem", "ash_wraith"], boss: "inferno_drake", rewardArmor: "ember_armor", rewardWeapon: "ember_weapon", rewardCharm: "ember_charm", treasure: "emberheart_ring" },
	storm: { name: "Cidadela da Tempestade", label: "TROVÃO", x: 3300, y: 1000, tier: 3, element: "lightning", enemies: ["storm_hawk", "thunder_golem", "storm_wraith", "sky_serpent"], boss: "storm_titan", rewardArmor: "storm_armor", rewardWeapon: "storm_weapon", rewardCharm: "storm_charm", treasure: "tempest_spurs" },
	frost: { name: "Palácio do Inverno", label: "GELO", x: -1800, y: -2100, tier: 4, element: "ice", enemies: ["ice_wraith", "stone_golem", "wolf", "frost_lich"], boss: "glacier_queen", rewardArmor: "frost_armor", rewardWeapon: "frost_weapon", rewardCharm: "frost_charm", treasure: "glacier_circlet" },
	crypt: { name: "Cripta do Eclipse", label: "ECLIPSE", x: -2600, y: 700, tier: 5, element: "dark", enemies: ["cultist", "skeleton", "ash_wraith", "storm_wraith"], boss: "blood_archon", rewardArmor: "crypt_armor", rewardWeapon: "crypt_weapon", rewardCharm: "crypt_charm", treasure: "mourning_veil" },
	dunes: { name: "Templo das Areias", label: "DUNAS", x: 2600, y: -1700, tier: 6, element: "earth", enemies: ["sand_scorpion", "mirage_wisp", "dune_raider", "sand_wyrm"], boss: "dune_titan", rewardArmor: "dune_armor", rewardWeapon: "dune_weapon", rewardCharm: "dune_charm", treasure: "sandstalker_greaves" },
	crystal: { name: "Galeria Prismática", label: "PRISMA", x: -3400, y: 2100, tier: 7, element: "arcane", enemies: ["crystal_golem", "prism_wisp", "cave_moth", "shard_beast"], boss: "prism_dragon", rewardArmor: "crystal_armor", rewardWeapon: "crystal_weapon", rewardCharm: "crystal_charm", treasure: "prismatic_mantle" },
	coast: { name: "Palácio Submerso", label: "RECIFE", x: 1300, y: -2350, tier: 8, element: "water", enemies: ["reef_crab", "coral_keeper", "reef_witch", "drowned"], boss: "coral_colossus", rewardArmor: "sea_tunic", rewardWeapon: "tide_spear", rewardCharm: "abyssal_necklace", treasure: "coralweave_sash" },
	jungle: { name: "Santuário da Copa Antiga", label: "SELVA", x: 4500, y: 2700, tier: 9, element: "nature", enemies: ["vine_stalker", "jungle_troll", "canopy_wyrm", "briarling"], boss: "jungle_hydra", rewardArmor: "jungle_mail", rewardWeapon: "jungle_bow", rewardCharm: "worldroot_belt", treasure: "worldroot_vambraces" },
};

const craftingRecipes = {
	rune_blade: { materials: { iron_ore: 4, copper_ore: 2, ash_token: 1 } },
	moon_bow: { materials: { wolf_pelt: 2, spider_silk: 3, moon_dust: 1 } },
	bloodwood_staff: { materials: { moon_dust: 2, void_essence: 1, frost_shard: 1 } },
	warden_mace: { materials: { iron_ore: 3, stone_heart: 2, boss_core: 1 } },
	obsidian_daggers: { materials: { iron_ore: 2, void_essence: 2, boss_core: 1 } },
	hearth_charm: { materials: { copper_ore: 3, wolf_pelt: 2 } },
	arcane_charm: { materials: { moon_dust: 2, frost_shard: 1, slime_gel: 2 } },
	frost_charm: { materials: { frost_shard: 3, moon_dust: 1, boss_core: 1 } },
	rune_mail: { materials: { iron_ore: 5, stone_heart: 2, ash_token: 1 } },
	verdant_robe: { materials: { spider_silk: 3, slime_gel: 3, moon_dust: 1 } },
	dune_weapon: { materials: { dragon_scale: 3, desert_glass: 3, boss_core: 1 } },
	dune_armor: { materials: { dragon_scale: 2, desert_glass: 2, iron_ore: 3 } },
	dune_charm: { materials: { desert_glass: 4, moon_dust: 2 } },
	crystal_weapon: { materials: { prism_shard: 3, void_essence: 2, boss_core: 2 } },
	crystal_armor: { materials: { prism_shard: 4, dragon_scale: 2, boss_core: 1 } },
	crystal_charm: { materials: { prism_shard: 3, void_essence: 2 } },
	bard_lyre: { materials: { moon_dust: 2, spider_silk: 2, void_essence: 1 } },
	ranger_longbow: { materials: { wolf_pelt: 3, spider_silk: 3, dragon_scale: 1 } },
	duelist_sabre: { materials: { iron_ore: 4, copper_ore: 3, boss_core: 1 } },
	bone_staff: { materials: { ancient_bone: 3, void_essence: 1, boss_core: 1 } },
	monk_gauntlets: { materials: { wolf_pelt: 3, iron_ore: 3, dragon_scale: 1 } },
	minor_potion: { materials: { slime_gel: 2, wolf_pelt: 1 } },
	mana_tonic: { materials: { slime_gel: 2, moon_dust: 1 } },
	mossbound_boots: { materials: { slime_gel: 3, wolf_pelt: 2, heartwood: 1 } },
	abyssal_bracers: { materials: { coral_fragment: 3, stone_heart: 2, moon_dust: 1 } },
	emberheart_ring: { materials: { ember_scale: 2, ash_token: 2, copper_ore: 3 } },
	tempest_spurs: { materials: { moon_dust: 2, void_essence: 1, iron_ore: 3 } },
	glacier_circlet: { materials: { frost_shard: 3, ancient_bone: 2, moon_dust: 1 } },
	mourning_veil: { materials: { void_essence: 3, ash_token: 2, spider_silk: 2 } },
	sandstalker_greaves: { materials: { desert_glass: 3, dragon_scale: 1, iron_ore: 3 } },
	prismatic_mantle: { materials: { prism_shard: 3, void_essence: 2, dragon_scale: 2 } },
	coralweave_sash: { materials: { coral_fragment: 3, heartwood: 2, spider_silk: 2 } },
	worldroot_vambraces: { materials: { heartwood: 3, dragon_scale: 2, boss_core: 1 } },
};

const enemyTypes = {
	slime: { name: "Limo verde", color: "#79a94f", hp: 34, damage: 7, speed: 42, xp: 18, attackType: "physical", resistances: { physical: 0.75 }, weaknesses: { lightning: 1.6, fire: 1.3 } },
	goblin: { name: "Goblin errante", color: "#72954f", hp: 52, damage: 10, speed: 57, xp: 24, attackType: "physical", resistances: { poison: 0.8 }, weaknesses: { fire: 1.25, radiant: 1.15 } },
	skeleton: { name: "Esqueleto", color: "#d1c6a4", hp: 68, damage: 13, speed: 39, xp: 32, attackType: "physical", resistances: { physical: 0.55, poison: 0.5 }, weaknesses: { fire: 1.2, radiant: 1.7 } },
	bat: { name: "Morcego febril", color: "#7d628e", hp: 30, damage: 8, speed: 72, xp: 21, attackType: "physical", resistances: { nature: 0.8 }, weaknesses: { lightning: 1.45 } },
	wolf: { name: "Lobo cinzento", color: "#817d71", hp: 62, damage: 12, speed: 67, xp: 30, attackType: "physical", resistances: { poison: 0.75 }, weaknesses: { fire: 1.35, radiant: 1.15 } },
	spider: { name: "Aranha cavernosa", color: "#573f43", hp: 48, damage: 11, speed: 54, xp: 29, attackType: "poison", resistances: { poison: 0.45 }, weaknesses: { fire: 1.5, ice: 1.2 } },
	ice_wraith: { name: "Espectro glacial", color: "#80c8d2", hp: 82, damage: 15, speed: 48, xp: 42, attackType: "ice", resistances: { ice: 0.35 }, weaknesses: { fire: 1.7, radiant: 1.25 } },
	stone_golem: { name: "Golem de pedra", color: "#777b70", hp: 118, damage: 19, speed: 28, xp: 55, attackType: "earth", resistances: { physical: 0.45, lightning: 0.8 }, weaknesses: { ice: 1.4, nature: 1.25 } },
	ember_drake: { name: "Draco de brasa", color: "#c75d38", hp: 105, damage: 20, speed: 46, xp: 58, attackType: "fire", resistances: { fire: 0.35 }, weaknesses: { water: 1.7, ice: 1.4 } },
	cultist: { name: "Cultista das cinzas", color: "#57495e", hp: 90, damage: 17, speed: 43, xp: 50, attackType: "fire", resistances: { fire: 0.8, radiant: 0.7 }, weaknesses: { water: 1.4, lightning: 1.25 } },
	boss: { name: "Guardião do bosque", color: "#9b5545", hp: 270, damage: 19, speed: 34, xp: 130, attackType: "nature", resistances: { physical: 0.75, nature: 0.65 }, weaknesses: { fire: 1.4, lightning: 1.2 } },
	frost_lich: { name: "Lich da geada", color: "#82a9c5", hp: 330, damage: 24, speed: 32, xp: 180, attackType: "ice", resistances: { ice: 0.3, poison: 0.7 }, weaknesses: { fire: 1.8, physical: 1.25 } },
	inferno_drake: { name: "Draco infernal", color: "#c94631", hp: 410, damage: 30, speed: 38, xp: 240, attackType: "fire", resistances: { fire: 0.25, physical: 0.8 }, weaknesses: { water: 1.8, ice: 1.5 } },
	glacier_queen: { name: "Rainha glacial", color: "#80c8d2", hp: 510, damage: 36, speed: 36, xp: 320, attackType: "ice", resistances: { ice: 0.2, water: 0.65 }, weaknesses: { fire: 1.8, lightning: 1.25 } },
	blood_archon: { name: "Arconte de sangue", color: "#81374a", hp: 570, damage: 40, speed: 38, xp: 360, attackType: "dark", resistances: { dark: 0.25, blood: 0.4 }, weaknesses: { radiant: 1.7, fire: 1.3 } },
	briarling: { name: "Espinheiro vivo", color: "#5b9a52", hp: 54, damage: 10, speed: 48, xp: 25, attackType: "nature", resistances: { nature: 0.5, water: 0.8 }, weaknesses: { fire: 1.5, ice: 1.2 } },
	moss_troll: { name: "Troll musgoso", color: "#607c48", hp: 100, damage: 17, speed: 32, xp: 48, attackType: "earth", resistances: { nature: 0.65, physical: 0.8 }, weaknesses: { fire: 1.35, water: 1.2 } },
	water_wisp: { name: "Fagulha das marés", color: "#52bed0", hp: 58, damage: 12, speed: 63, xp: 34, attackType: "water", resistances: { water: 0.4, ice: 0.75 }, weaknesses: { lightning: 1.6, nature: 1.2 } },
	reef_guardian: { name: "Guardião de coral", color: "#d47769", hp: 112, damage: 18, speed: 34, xp: 52, attackType: "water", resistances: { water: 0.5, physical: 0.8 }, weaknesses: { lightning: 1.5, nature: 1.25 } },
	drowned: { name: "Afogado abissal", color: "#547b7d", hp: 86, damage: 16, speed: 42, xp: 45, attackType: "water", resistances: { water: 0.65, poison: 0.8 }, weaknesses: { lightning: 1.4, radiant: 1.25 } },
	tide_siren: { name: "Sereia da tormenta", color: "#7669ad", hp: 78, damage: 17, speed: 52, xp: 47, attackType: "water", resistances: { water: 0.5 }, weaknesses: { lightning: 1.5, poison: 1.2 } },
	leviathan: { name: "Leviatã das marés", color: "#338b9a", hp: 380, damage: 27, speed: 34, xp: 205, attackType: "water", resistances: { water: 0.25, ice: 0.7 }, weaknesses: { lightning: 1.8, nature: 1.3 } },
	fire_imp: { name: "Diabrete de fogo", color: "#e8773f", hp: 70, damage: 15, speed: 66, xp: 40, attackType: "fire", resistances: { fire: 0.4 }, weaknesses: { water: 1.7, ice: 1.4 } },
	magma_golem: { name: "Golem de magma", color: "#a84831", hp: 140, damage: 23, speed: 26, xp: 68, attackType: "fire", resistances: { fire: 0.3, physical: 0.7 }, weaknesses: { water: 1.8, ice: 1.5 } },
	ash_wraith: { name: "Espectro de cinzas", color: "#82706b", hp: 96, damage: 19, speed: 50, xp: 56, attackType: "fire", resistances: { fire: 0.45, poison: 0.75 }, weaknesses: { water: 1.6, radiant: 1.3 } },
	storm_hawk: { name: "Falcão trovejante", color: "#8da9d1", hp: 74, damage: 17, speed: 76, xp: 46, attackType: "lightning", resistances: { lightning: 0.4 }, weaknesses: { earth: 1.6, ice: 1.2 } },
	thunder_golem: { name: "Golem do trovão", color: "#68789d", hp: 150, damage: 25, speed: 27, xp: 74, attackType: "lightning", resistances: { lightning: 0.3, physical: 0.7 }, weaknesses: { earth: 1.8, nature: 1.25 } },
	storm_wraith: { name: "Espectro da tempestade", color: "#687bc2", hp: 100, damage: 21, speed: 54, xp: 61, attackType: "lightning", resistances: { lightning: 0.35, arcane: 0.8 }, weaknesses: { earth: 1.7, fire: 1.2 } },
	sky_serpent: { name: "Serpente celeste", color: "#a7bd69", hp: 118, damage: 22, speed: 62, xp: 67, attackType: "lightning", resistances: { lightning: 0.45 }, weaknesses: { earth: 1.6, ice: 1.25 } },
	storm_titan: { name: "Titã da tempestade", color: "#626f9b", hp: 460, damage: 33, speed: 30, xp: 270, attackType: "lightning", resistances: { lightning: 0.25, physical: 0.75 }, weaknesses: { earth: 1.9, nature: 1.35 } },
	sand_scorpion: { name: "Escorpião das dunas", color: "#b77d45", hp: 104, damage: 20, speed: 56, xp: 65, attackType: "poison", resistances: { poison: 0.5, earth: 0.8 }, weaknesses: { ice: 1.4, water: 1.25 } },
	mirage_wisp: { name: "Fagulha da miragem", color: "#e5cb78", hp: 76, damage: 22, speed: 68, xp: 70, attackType: "arcane", resistances: { fire: 0.8, earth: 0.7 }, weaknesses: { water: 1.4, lightning: 1.25 } },
	dune_raider: { name: "Saqueador do deserto", color: "#927151", hp: 126, damage: 24, speed: 52, xp: 78, attackType: "physical", resistances: { physical: 0.8 }, weaknesses: { radiant: 1.3, poison: 1.2 } },
	sand_wyrm: { name: "Verme de areia", color: "#c48d50", hp: 158, damage: 28, speed: 34, xp: 90, attackType: "earth", resistances: { earth: 0.45, physical: 0.8 }, weaknesses: { water: 1.7, ice: 1.3 } },
	dune_titan: { name: "Titã das areias", color: "#d0a45f", hp: 680, damage: 47, speed: 29, xp: 440, attackType: "earth", resistances: { earth: 0.25, physical: 0.7 }, weaknesses: { water: 1.8, nature: 1.4 } },
	crystal_golem: { name: "Golem prismático", color: "#709cb2", hp: 180, damage: 30, speed: 28, xp: 105, attackType: "arcane", resistances: { arcane: 0.4, physical: 0.7 }, weaknesses: { earth: 1.7, lightning: 1.25 } },
	prism_wisp: { name: "Espírito de cristal", color: "#b4e1df", hp: 98, damage: 27, speed: 70, xp: 92, attackType: "arcane", resistances: { arcane: 0.4, ice: 0.7 }, weaknesses: { physical: 1.35, dark: 1.3 } },
	cave_moth: { name: "Mariposa cavernosa", color: "#a696c5", hp: 112, damage: 25, speed: 78, xp: 88, attackType: "dark", resistances: { dark: 0.7 }, weaknesses: { fire: 1.4, radiant: 1.35 } },
	shard_beast: { name: "Fera de estilhaços", color: "#647f91", hp: 194, damage: 34, speed: 47, xp: 118, attackType: "physical", resistances: { physical: 0.65, ice: 0.7 }, weaknesses: { earth: 1.6, fire: 1.3 } },
	prism_dragon: { name: "Dragão prismático", color: "#7fb4bf", hp: 820, damage: 54, speed: 36, xp: 560, attackType: "arcane", resistances: { arcane: 0.25, ice: 0.65 }, weaknesses: { physical: 1.45, dark: 1.5 } },
	reef_crab: { name: "Caranguejo de coral", color: "#db8066", hp: 148, damage: 25, speed: 30, xp: 86, attackType: "physical", resistances: { physical: 0.45, water: 0.5 }, weaknesses: { lightning: 1.5, nature: 1.2 } },
	coral_keeper: { name: "Sentinela do recife", color: "#61a5a1", hp: 180, damage: 28, speed: 32, xp: 98, attackType: "water", resistances: { water: 0.45, physical: 0.35 }, weaknesses: { lightning: 1.6, earth: 1.2 } },
	reef_witch: { name: "Bruxa das profundezas", color: "#8274b6", hp: 132, damage: 31, speed: 44, xp: 94, attackType: "water", resistances: { water: 0.35 }, weaknesses: { lightning: 1.7, radiant: 1.2 } },
	coral_colossus: { name: "Colosso de coral", color: "#ce6e61", hp: 1050, damage: 59, speed: 28, xp: 690, attackType: "water", resistances: { water: 0.3, physical: 0.4 }, weaknesses: { lightning: 1.8, nature: 1.3 } },
	vine_stalker: { name: "Perseguidor de cipós", color: "#4c8b49", hp: 205, damage: 31, speed: 55, xp: 120, attackType: "nature", resistances: { nature: 0.4, poison: 0.45 }, weaknesses: { fire: 1.7, ice: 1.25 } },
	jungle_troll: { name: "Troll da copa", color: "#6d8b48", hp: 260, damage: 38, speed: 30, xp: 145, attackType: "physical", resistances: { physical: 0.35, nature: 0.5 }, weaknesses: { fire: 1.5, ice: 1.25 } },
	canopy_wyrm: { name: "Serpe das folhas", color: "#b2a34f", hp: 190, damage: 34, speed: 60, xp: 138, attackType: "poison", resistances: { poison: 0.35 }, weaknesses: { fire: 1.5, ice: 1.3 } },
	jungle_hydra: { name: "Hidra das raízes", color: "#5c8741", hp: 1280, damage: 68, speed: 32, xp: 820, attackType: "nature", resistances: { nature: 0.3, poison: 0.4 }, weaknesses: { fire: 1.8, ice: 1.4 } },
};

function spawnEnemy(type, x, y, level = state.player.level, boss = false) {
	const base = enemyTypes[type];
	const scale = Math.max(0, level - 1);
	const maxHp = Math.round(base.hp + scale * (boss ? 42 : 12) + scale ** 2 * (boss ? 0.8 : 0.28));
	state.enemies.push({ type, name: base.name, color: base.color, attackType: base.attackType, resistances: base.resistances, weaknesses: base.weaknesses, x, y, level, hp: maxHp, maxHp, damage: Math.round(base.damage + scale * (boss ? 3.2 : 2.7)), speed: base.speed + Math.min(20, scale * 0.45), xp: base.xp + scale * 7, boss, cooldown: 0, status: [], dead: false });
}

function startRoom(room, dungeonId = state.dungeonId || "woodland") {
	const dungeon = dungeons[dungeonId];
	if (!dungeon || room < 1 || room > 12) return;
	if (room === 1) {
		state.returnPosition = { x: state.player.x, y: state.player.y };
		state.dungeonId = dungeonId;
	}
	state.scene = "dungeon"; state.room = room; state.player.x = 0; state.player.y = 130; state.enemies = []; state.projectiles = [];
	const level = Math.min(99, state.player.level + room - 1 + dungeon.tier * 3);
	const positions = [[-145, -65], [145, -65], [-85, 35], [85, 35], [0, -105], [-205, 70], [205, 70]];
	const regularCount = room === 12 ? 2 : Math.min(7, 2 + Math.floor((room - 1) / 2) + Math.floor(dungeon.tier / 2));
	for (let index = 0; index < regularCount; index += 1) {
		const [x, y] = positions[index];
		const type = dungeon.enemies[Math.floor(Math.random() * dungeon.enemies.length)];
		spawnEnemy(type, x, y, level);
	}
	if (room === 12) spawnEnemy(dungeon.boss, 0, -90, Math.min(99, level + 2), true);
	state.panel = null; panel.hidden = true;
	saveProgress();
	showToast(room === 12 ? `${enemyTypes[dungeon.boss].name} aguarda no último andar!` : `${dungeon.name} · andar ${room} de 12.`);
}

function exitDungeon() {
	const dungeon = dungeons[state.dungeonId];
	if (dungeon) {
		for (const drop of state.drops) {
			if (drop.scene !== "dungeon" || drop.dungeonId !== state.dungeonId) continue;
			drop.x += dungeon.x;
			drop.y += dungeon.y;
			drop.scene = "world";
			delete drop.dungeonId;
		}
	}
	state.scene = "world"; state.room = 0; state.dungeonId = null; state.enemies = []; state.projectiles = [];
	state.player.x = state.returnPosition?.x ?? 0; state.player.y = state.returnPosition?.y ?? -260;
	state.returnPosition = null;
	saveProgress();
	showToast("Você voltou ao prado. Os tesouros restantes estão perto da entrada.");
}

function showToast(message) {
	toast.textContent = message; toast.classList.add("visible");
	window.clearTimeout(state.toastTimer);
	state.toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 1900);
}

function addFloating(x, y, text, color = "#fff0c2") {
	state.floating.push({ x, y, text, color, life: 0.8 });
}

function gainXp(amount) {
	const player = state.player;
	player.xp += amount;
	let leveled = false;
	while (player.xp >= player.nextXp) {
		player.xp -= player.nextXp; player.level += 1; player.nextXp = Math.round(player.nextXp * 1.32);
		player.statPoints += 2; player.skillPoints += 1; player.hp = getStats().maxHp; player.mp = getStats().maxMp; leveled = true;
	}
	if (leveled) showToast(`Nível ${player.level}! +2 atributos e +1 ponto de habilidade.`);
}

function dropLoot(enemy) {
	const dropLocation = { scene: state.scene, dungeonId: state.scene === "dungeon" ? state.dungeonId : undefined };
	const lootTier = state.scene === "dungeon"
		? Math.min(9, dungeons[state.dungeonId].tier + Math.floor((state.room - 1) / 3) + 1)
		: Math.min(9, Math.floor(Math.hypot(enemy.x, enemy.y) / 700));
	const amount = Math.round((enemy.boss ? 75 + enemy.level * 6 : 4 + Math.floor(Math.random() * 8) + enemy.level * 2) * (1 + lootTier * 0.3));
	const droppedItems = new Set();
	const dropItem = (itemId, x, y) => {
		if (!items[itemId] || droppedItems.has(itemId) || playerOwnsItem(itemId) || hasPendingItemDrop(itemId)) return;
		state.drops.push({ ...dropLocation, x, y, kind: "item", item: itemId });
		droppedItems.add(itemId);
	};
	state.drops.push({ ...dropLocation, x: enemy.x, y: enemy.y + 8, kind: "coins", amount });
	const armor = Object.entries(items)
		.filter(([id, item]) => item.slot === "armor" && item.lootTier > 0 && item.lootTier <= lootTier && !playerOwnsItem(id) && !hasPendingItemDrop(id))
		.sort(([, a], [, b]) => b.lootTier - a.lootTier);
	const bestArmorTier = armor[0]?.[1].lootTier;
	const armorPool = armor.filter(([, item]) => item.lootTier === bestArmorTier);
	const regionalGear = state.scene === "dungeon"
		? [dungeons[state.dungeonId].treasure]
		: Object.entries(items).filter(([, item]) => item.lootBiome === getBiome(enemy.x, enemy.y)).map(([id]) => id);
	const availableRegionalGear = regionalGear.filter((id) => items[id]?.lootTier <= lootTier && !playerOwnsItem(id) && !hasPendingItemDrop(id));
	if (enemy.boss) {
		state.drops.push({ ...dropLocation, x: enemy.x - 25, y: enemy.y + 10, kind: "item", item: "boss_core" });
		dropItem(classes[state.player.classId].rewardWeapon, enemy.x + 25, enemy.y + 10);
		if (state.scene === "dungeon") {
			const dungeon = dungeons[state.dungeonId];
			dropItem(dungeon.rewardWeapon, enemy.x - 25, enemy.y - 20);
			dropItem(dungeon.rewardCharm, enemy.x + 25, enemy.y - 20);
			dropItem(dungeon.rewardArmor, enemy.x - 25, enemy.y - 38);
			dropItem(dungeon.treasure, enemy.x + 25, enemy.y - 38);
		} else if (armorPool.length) {
			const [item] = armorPool[Math.floor(Math.random() * armorPool.length)];
			dropItem(item, enemy.x, enemy.y - 20);
		}
		return;
	}
	if (armorPool.length && Math.random() < Math.min(0.6, 0.06 + lootTier * 0.08)) {
		const [item] = armorPool[Math.floor(Math.random() * armorPool.length)];
		dropItem(item, enemy.x + 12, enemy.y);
	}
	if (availableRegionalGear.length && Math.random() < 0.18) {
		const item = availableRegionalGear[Math.floor(Math.random() * availableRegionalGear.length)];
		dropItem(item, enemy.x - 12, enemy.y);
	}
	if (Math.random() < 0.3) {
		const materials = {
			slime: "slime_gel", goblin: "copper_ore", skeleton: "iron_ore", wolf: "wolf_pelt",
			spider: "spider_silk", ice_wraith: "frost_shard", stone_golem: "stone_heart", briarling: "slime_gel",
			moss_troll: "wolf_pelt", water_wisp: "frost_shard", reef_guardian: "stone_heart", drowned: "frost_shard",
			tide_siren: "moon_dust", leviathan: "frost_shard", fire_imp: "ember_scale", magma_golem: "stone_heart",
			ash_wraith: "ash_token", storm_hawk: "moon_dust", thunder_golem: "stone_heart", storm_wraith: "void_essence",
			sky_serpent: "ash_token", storm_titan: "void_essence",
			sand_scorpion: "desert_glass", mirage_wisp: "desert_glass", dune_raider: "ancient_bone",
			sand_wyrm: "dragon_scale", dune_titan: "dragon_scale", crystal_golem: "prism_shard",
			prism_wisp: "prism_shard", cave_moth: "void_essence", shard_beast: "prism_shard", prism_dragon: "prism_shard",
			reef_crab: "coral_fragment", coral_keeper: "coral_fragment", reef_witch: "coral_fragment", coral_colossus: "coral_fragment",
			vine_stalker: "heartwood", jungle_troll: "heartwood", canopy_wyrm: "heartwood", jungle_hydra: "heartwood",
			ember_drake: "ember_scale", cultist: "moon_dust", frost_lich: "frost_shard",
			inferno_drake: "ember_scale", glacier_queen: "frost_shard", blood_archon: "void_essence", boss: "wolf_pelt",
		};
		const loot = materials[enemy.type] || "minor_potion";
		state.drops.push({ ...dropLocation, x: enemy.x + 12, y: enemy.y, kind: "item", item: loot });
	}
}

function defeatEnemy(enemy) {
	if (enemy.dead) return;
	enemy.dead = true; state.quests.kills += 1; gainXp(enemy.xp); dropLoot(enemy);
	addFloating(enemy.x, enemy.y - 20, `+${enemy.xp} XP`, "#e2ee9b");
	if (enemy.boss) { state.quests.bosses += 1; showToast("Chefe derrotado! Recompensas raras no chão."); }
}

function damageEnemy(enemy, amount, color = "#fff0c2", damageType = "physical") {
	if (enemy.dead) return;
	const stats = getStats();
	const multiplierFor = (element) => (enemy.resistances[element] ?? 1) * (enemy.weaknesses[element] ?? 1);
	const multiplier = multiplierFor(damageType);
	const bonusDamage = Object.entries(stats.elementalDamage).reduce((total, [element, bonus]) => total + amount * bonus * multiplierFor(element), 0);
	const damage = Math.max(1, amount * multiplier + bonusDamage);
	const affinityElement = [damageType, ...Object.keys(stats.elementalDamage)].find((element) => multiplierFor(element) !== 1);
	const affinityMultiplier = affinityElement ? multiplierFor(affinityElement) : 1;
	const affinity = affinityMultiplier < 1
		? ` RESISTE: ${(elementNames[affinityElement] || affinityElement).toUpperCase()}`
		: affinityMultiplier > 1 ? ` FRAQUEZA: ${(elementNames[affinityElement] || affinityElement).toUpperCase()}` : "";
	const dealtDamage = Math.min(enemy.hp, damage);
	enemy.hp -= damage; addFloating(enemy.x, enemy.y - 12, `-${Math.round(dealtDamage)}${affinity}`, color);
	if (enemy.hp <= 0) defeatEnemy(enemy);
	return dealtDamage;
}

function nearestEnemy(maxDistance = 70) {
	let target = null; let best = maxDistance;
	for (const enemy of state.enemies) {
		if (enemy.dead) continue;
		const distance = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
		if (distance < best) { target = enemy; best = distance; }
	}
	return target;
}

function launchProjectile(target, damage, damageType, effect, visualKind = effect, lifeSteal = 0) {
	state.projectiles.push({
		x: state.player.x, y: state.player.y - 10, target, damage, damageType, effect, visualKind,
		lifeSteal,
		speed: visualKind === "arrow" ? 700 : 560,
	});
}

function updateProjectiles(delta) {
	state.projectiles = state.projectiles.filter((projectile) => {
		const target = projectile.target;
		if (target.dead) return false;
		const dx = target.x - projectile.x;
		const dy = target.y - projectile.y;
		const distance = Math.hypot(dx, dy) || 1;
		const step = projectile.speed * delta;
		if (distance > step + 12) {
			projectile.x += dx / distance * step;
			projectile.y += dy / distance * step;
			return true;
		}
		const colors = { fire: "#ff9a5c", ice: "#a9efff", dark: "#b49ad9", blood: "#ef7585" };
		const color = colors[projectile.damageType] || "#f1d88a";
		const dealtDamage = damageEnemy(target, projectile.damage, color, projectile.damageType);
		const healing = Math.min(getStats().maxHp - state.player.hp, dealtDamage * projectile.lifeSteal);
		state.player.hp += healing;
		if (healing > 0) addFloating(state.player.x, state.player.y - 27, `+${Math.round(healing)} PV`, "#c54556");
		if (!target.dead && projectile.damageType === "fire") target.status.push({ type: "burn", time: 3, tick: 1 });
		if (!target.dead && projectile.damageType === "poison") target.status.push({ type: "poison", time: 4, tick: 1 });
		if (!target.dead && projectile.damageType === "ice") target.status.push({ type: "slow", time: 2, tick: 2 });
		if (projectile.effect === "chain") {
			const chained = state.enemies
				.filter((enemy) => enemy !== target && !enemy.dead && Math.hypot(enemy.x - target.x, enemy.y - target.y) < 155)
				.sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y))
				.slice(0, 2);
			for (const enemy of chained) damageEnemy(enemy, projectile.damage * 0.65, "#f6e45e", projectile.damageType);
		}
		return false;
	});
}

function basicAttack() {
	basicAttackAt(null);
}

function basicAttackAt(point) {
	if (!state.started) return;
	if (state.attackCooldown > 0) return;
	state.attackCooldown = 0.36;
	const stats = getStats();
	let target;
	if (point) {
		target = nearestEnemy(Math.min(100, stats.attackRange));
		if (!target) {
			target = state.enemies
				.filter((enemy) => !enemy.dead && Math.hypot(enemy.x - point.x, enemy.y - point.y) <= 42 && Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y) <= stats.attackRange)
				.sort((a, b) => Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y))[0];
		}
	} else target = nearestEnemy(stats.attackRange);
	if (!target && !point) { showToast("Nenhum inimigo ao alcance."); return; }
	const attackPoint = target ? { x: target.x, y: target.y } : point;
	const ranged = stats.ranged;
	const classId = state.player.classId;
	if (!target) return;
	if (!ranged) state.attacks.push({ ...attackPoint, life: 0.22 });
	const damageType = classId === "mage" ? state.player.element : items[state.player.equipment.weapon]?.element || (classId === "healer" ? "radiant" : classId === "druid" ? "nature" : classId === "necromancer" ? "dark" : "physical");
	const magicClass = ["mage", "healer", "druid", "necromancer", "bard"].includes(classId);
	const base = magicClass ? unboostedMagic(stats.magic) : ["archer", "ranger"].includes(classId) ? stats.bowAttack : stats.attack;
	const spellBonus = magicClass ? elfMagicMultiplier(damageType, classId) : 1;
	const damage = (base + Math.random() * 4) * stats.damageMultiplier * spellBonus;
	if (ranged) {
		launchProjectile(target, damage, damageType, "basic", ["archer", "ranger"].includes(classId) ? "arrow" : "spell");
		return;
	}
	const dealtDamage = damageEnemy(target, damage, "#fff0c2", damageType);
	if (stats.lifeSteal) {
		const healing = Math.min(getStats().maxHp - state.player.hp, dealtDamage * stats.lifeSteal);
		state.player.hp += healing;
		if (healing > 0) addFloating(state.player.x, state.player.y - 27, `+${Math.round(healing)} PV`, "#c54556");
	}
}

function unboostedMagic(magic) {
	return magic / (state.player.raceId === "elf" ? 1.25 : state.player.raceId === "fairy" ? 1.12 : 1);
}

function elfMagicMultiplier(damageType, classId) {
	if (state.player.raceId === "fairy") return 1.12;
	if (state.player.raceId !== "elf") return 1;
	return damageType === "nature" || classId === "druid" ? 1.5 : 1.25;
}

function castSkill(id) {
	if (!state.started) return;
	if (id === "attack") { basicAttack(); return; }
	if (id === "potion") { useQuickPotion(); return; }
	const slot = Number(id.replace("slot", ""));
	const skillId = Number.isInteger(slot) && slot > 0 ? state.equippedSkills[slot - 1] : id;
	const info = skillInfo[skillId];
	if (!info) return;
	if (!state.skills.includes(skillId)) { showToast(`Habilidade bloqueada: requer nível ${info.level}.`); return; }
	if (!state.equippedSkills.includes(skillId)) { showToast("Equipe essa habilidade em um espaço de 1 a 5."); return; }
	if ((state.cooldowns[skillId] || 0) > 0) { showToast("Habilidade recarregando."); return; }
	if (state.player.mp < info.cost) { showToast("Mana insuficiente."); return; }
	const stats = getStats();
	const closeTargets = state.enemies.filter((enemy) => !enemy.dead && Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y) <= (info.kind === "spin" || info.kind === "taunt" ? 125 : 78));
	const rangedKind = ["fire", "ice", "chain", "shot", "volley", "poison", "radiant", "nature", "elemental"].includes(info.kind);
	const target = rangedKind ? nearestEnemy(600) : closeTargets[0];
	if (rangedKind && !target) { showToast("Não há alvo ao alcance."); return; }
	if (["melee", "spin", "execute", "taunt"].includes(info.kind) && !closeTargets.length) { showToast("Nenhum inimigo ao alcance."); return; }
	state.player.mp -= info.cost; state.cooldowns[skillId] = info.cooldown;
	const physical = ["warrior", "archer", "ranger", "tank", "rogue", "paladin", "monk", "duelist"].includes(state.player.classId) && !["radiant", "elemental"].includes(info.kind);
	const base = physical ? (["archer", "ranger"].includes(state.player.classId) ? stats.bowAttack : stats.attack) : unboostedMagic(stats.magic);
	const damageType = info.damageType || ({ fire: "fire", ice: "ice", chain: "lightning", poison: "poison", radiant: "radiant" }[info.kind] || "physical");
	const spellBonus = !physical || info.damageType || info.kind === "heal" ? elfMagicMultiplier(damageType, state.player.classId) : 1;
	const healingBonus = ["gnome", "fairy"].includes(state.player.raceId) ? state.player.raceId === "fairy" ? 1.2 : 1.15 : 1;
	const hit = (enemy, multiplier = info.power) => {
		const damage = (base * multiplier + 5) * stats.damageMultiplier * spellBonus;
		const dealtDamage = damageEnemy(enemy, damage, rangedKind ? "#f1d88a" : "#e9d39b", damageType);
		if (!enemy.dead && damageType === "poison") enemy.status.push({ type: "poison", time: 4, tick: 1 });
		if (!enemy.dead && damageType === "fire") enemy.status.push({ type: "burn", time: 3, tick: 1 });
		const lifeSteal = Math.max(stats.lifeSteal, info.lifeSteal || 0);
		if (["melee", "spin", "execute", "taunt"].includes(info.kind) && lifeSteal) {
			const healing = Math.min(getStats().maxHp - state.player.hp, dealtDamage * lifeSteal);
			state.player.hp += healing;
			if (healing > 0) addFloating(state.player.x, state.player.y - 25, `+${Math.round(healing)} PV`, "#c54556");
		}
	};

	if (info.kind === "heal") {
		const healing = Math.min(stats.maxHp - state.player.hp, (info.power + unboostedMagic(stats.magic) * 1.2) * spellBonus * healingBonus);
		state.player.hp += healing; addFloating(state.player.x, state.player.y - 25, `+${Math.round(healing)} PV`, "#a8e291");
		if (!healing) showToast("Sua vida já está cheia.");
	} else if (info.kind === "renew") {
		state.player.status.push({ type: "regen", time: 5, tick: 1, amount: (info.power + unboostedMagic(stats.magic) * 0.3) * spellBonus * healingBonus });
		addFloating(state.player.x, state.player.y - 24, "RENOVAÇÃO", "#a8e291");
	} else if (info.kind === "guard" || info.kind === "taunt") {
		state.player.status.push({ type: "guard", time: info.kind === "guard" ? 5 : 3, amount: info.power * spellBonus });
		for (const enemy of closeTargets) if (info.kind === "taunt") hit(enemy, 0.8);
		addFloating(state.player.x, state.player.y - 25, "DEFESA +", "#c5dca0");
	} else if (info.kind === "spin") {
		for (const enemy of closeTargets) hit(enemy);
	} else if (info.kind === "volley") {
		const targets = state.enemies.filter((enemy) => !enemy.dead && Math.hypot(enemy.x - target.x, enemy.y - target.y) < 155)
			.sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y)).slice(0, 3);
		for (const enemy of targets) {
			const damage = (base * info.power + 5) * stats.damageMultiplier * spellBonus;
			const visualKind = ["archer", "ranger"].includes(state.player.classId) ? "arrow" : info.kind;
			launchProjectile(enemy, damage, damageType, info.kind, visualKind, info.lifeSteal);
		}
	} else if (info.kind === "chain" || rangedKind) {
		const power = info.kind === "execute" && target.hp / target.maxHp < 0.35 ? info.power * 1.8 : info.power;
		const damage = (base * power + 5) * stats.damageMultiplier * spellBonus;
		const visualKind = ["archer", "ranger"].includes(state.player.classId) && ["shot", "poison"].includes(info.kind) ? "arrow" : info.kind;
		launchProjectile(target, damage, damageType, info.kind, visualKind, info.lifeSteal);
	} else {
		let power = info.power;
		if (info.kind === "execute" && target.hp / target.maxHp < 0.35) power *= 1.8;
		hit(target, power);
	}
}

function playerDamage(amount, source, damageType = source.attackType || "physical") {
	const stats = getStats();
	const guarded = state.player.status.find((effect) => effect.type === "guard");
	const resistance = stats.resistances[damageType] || 0;
	const damage = Math.max(1, (amount - stats.defense - (guarded?.amount || 0)) * stats.damageTaken * (1 - resistance));
	state.player.hp = Math.max(0, state.player.hp - damage);
	addFloating(state.player.x, state.player.y - 20, `-${Math.round(damage)} PV`, "#ff9b80");
	if (source.type === "bat" && Math.random() < 0.25) state.player.status.push({ type: "veneno", time: 4, tick: 1 });
	if (state.player.hp <= 0) {
		state.player.hp = Math.ceil(getStats().maxHp * 0.55); state.player.mp = Math.ceil(getStats().maxMp * 0.5);
		state.player.x = state.scene === "world" ? 0 : 0; state.player.y = state.scene === "world" ? 0 : 130;
		state.drops = []; showToast("Você foi resgatado. Perdeu parte do ouro."); state.player.coins = Math.max(0, state.player.coins - 8);
	}
}

function updateStatus(list, target, delta, isPlayer) {
	for (const effect of list) {
		effect.time -= delta; effect.tick -= delta;
		if (effect.tick <= 0 && effect.time > 0) {
			effect.tick = 1;
			if (effect.type === "regen") {
				const healing = isPlayer ? effect.amount : 0;
				if (isPlayer) target.hp = Math.min(getStats().maxHp, target.hp + healing);
			} else if (effect.type === "veneno") {
				target.hp = Math.max(1, target.hp - 3); addFloating(target.x, target.y - 18, "-3", "#8acc66");
			} else if (!isPlayer && ["burn", "poison"].includes(effect.type)) {
				damageEnemy(target, effect.type === "burn" ? 5 : 3, "#ff9a5c", effect.type === "burn" ? "fire" : "poison");
			}
		}
	}
	return list.filter((effect) => effect.time > 0);
}

function isTreeBlocked(x, y) {
	const tileX = Math.floor(x / tileSize); const tileY = Math.floor(y / tileSize);
	for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
		for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
			const tx = tileX + offsetX; const ty = tileY + offsetY;
			if (getTile(tx, ty).type !== "tree") continue;
			const tree = objectPosition(tx, ty);
			if (Math.hypot(tree.x - x, tree.y - y) < 25) return true;
		}
	}
	return false;
}

function isInsideSafeSpawn(x, y) {
	return Math.hypot(x, y) < safeSpawnRadius;
}

function isBlocked(x, y) {
	if (state.scene === "dungeon") return x < -321 || x > 321 || y < -192 || y > 160;
	return isTreeBlocked(x, y);
}

function updateEnemies(delta) {
	for (const enemy of [...state.enemies]) {
		if (enemy.dead) continue;
		enemy.status = updateStatus(enemy.status, enemy, delta, false);
		if (enemy.dead) continue;
		enemy.cooldown = Math.max(0, enemy.cooldown - delta);
		const dx = state.player.x - enemy.x; const dy = state.player.y - enemy.y;
		const distance = Math.hypot(dx, dy) || 1;
		if (state.scene === "world" && isInsideSafeSpawn(state.player.x, state.player.y)) continue;
		const slowed = enemy.status.some((effect) => effect.type === "slow");
		if (distance > 31) {
			const moveX = (dx / distance) * enemy.speed * (slowed ? 0.45 : 1) * delta;
			const moveY = (dy / distance) * enemy.speed * (slowed ? 0.45 : 1) * delta;
			if (!isBlocked(enemy.x + moveX, enemy.y) && !(state.scene === "world" && isInsideSafeSpawn(enemy.x + moveX, enemy.y))) enemy.x += moveX;
			if (!isBlocked(enemy.x, enemy.y + moveY) && !(state.scene === "world" && isInsideSafeSpawn(enemy.x, enemy.y + moveY))) enemy.y += moveY;
		} else if (enemy.cooldown <= 0) {
			enemy.cooldown = enemy.boss ? 0.9 : 1.25;
			playerDamage(enemy.damage, enemy, enemy.attackType);
		}
	}
	state.enemies = state.enemies.filter((enemy) => !enemy.dead);
}

function addItem(id) { state.player.inventory.push(id); }

function playerOwnsItem(itemId) {
	return state.player.inventory.includes(itemId) || Object.values(state.player.equipment).includes(itemId);
}

function hasPendingItemDrop(itemId) {
	return state.drops.some((drop) => drop.kind === "item" && drop.item === itemId);
}

function collectDrops() {
	let collected = false;
	for (let index = state.drops.length - 1; index >= 0; index -= 1) {
		const drop = state.drops[index];
		if (state.scene === "dungeon" ? drop.scene !== "dungeon" || drop.dungeonId !== state.dungeonId : drop.scene === "dungeon") continue;
		if (Math.hypot(drop.x - state.player.x, drop.y - state.player.y) > 27) continue;
		if (drop.kind === "coins") {
			const lootBonus = state.player.raceId === "dwarf" ? 1.25 : state.player.raceId === "goblin" ? 1.15 : 1;
			const amount = Math.ceil(drop.amount * lootBonus);
			state.player.coins += amount; addFloating(drop.x, drop.y, `+${amount} ouro`, "#f4d15b");
		}
		else { addItem(drop.item); addFloating(drop.x, drop.y, items[drop.item].name, "#e5edb6"); }
		state.drops.splice(index, 1);
		collected = true;
	}
	if (collected) saveProgress();
}

function getInteraction() {
	if (state.scene === "dungeon") {
		if (Math.hypot(state.player.x, state.player.y + 185) < 63) return { id: "door", text: state.enemies.length ? "Derrote todos para abrir a saída" : state.room < 12 ? "E · Avançar de andar" : "E · Sair da masmorra" };
		return null;
	}
	const spots = [
		{ id: "buyer", x: -145, y: -5, text: "E · Vender itens" },
		{ id: "vendor", x: 145, y: -5, text: "E · Comprar itens" },
		{ id: "forge", x: 0, y: 155, text: "E · Fabricar equipamentos" },
		...Object.entries(dungeons).map(([dungeonId, dungeon]) => ({
			id: "dungeon", dungeonId, x: dungeon.x, y: dungeon.y, text: `E · Entrar: ${dungeon.name}`,
		})),
	];
	return spots.find((spot) => Math.hypot(spot.x - state.player.x, spot.y - state.player.y) < 60) || null;
}

function interact() {
	const nearby = getInteraction();
	if (!nearby) { showToast("Nada para interagir aqui."); return; }
	if (nearby.id === "vendor") openPanel("vendor");
	if (nearby.id === "buyer") openPanel("buyer");
	if (nearby.id === "forge") openPanel("crafting");
	if (nearby.id === "dungeon") startRoom(1, nearby.dungeonId);
	if (nearby.id === "door") {
		if (state.enemies.length) showToast("A saída está selada. Derrote os inimigos primeiro.");
		else if (state.room < 12) startRoom(state.room + 1);
		else exitDungeon();
	}
}

function update(delta) {
	const player = state.player;
	state.dayTime += delta;
	const stats = getStats();
	const horizontal = Number(keys.has("right")) - Number(keys.has("left")) + joystickAxes.x;
	const vertical = Number(keys.has("down")) - Number(keys.has("up")) + joystickAxes.y;
	const length = Math.hypot(horizontal, vertical);
	const movementScale = length ? Math.min(length, 1) / length : 0;
	const moveX = horizontal * movementScale * stats.speed * delta;
	const moveY = vertical * movementScale * stats.speed * delta;
	if (horizontal || vertical) player.facing = Math.abs(horizontal) >= Math.abs(vertical) ? horizontal < 0 ? "left" : "right" : vertical < 0 ? "up" : "down";
	if (moveX && !isBlocked(player.x + moveX, player.y)) player.x += moveX;
	if (moveY && !isBlocked(player.x, player.y + moveY)) player.y += moveY;
	player.hp = Math.min(player.hp, stats.maxHp); player.mp = Math.min(stats.maxMp, player.mp + 1.2 * delta);
	player.status = updateStatus(player.status, player, delta, true);
	state.attackCooldown = Math.max(0, state.attackCooldown - delta);
	for (const id of Object.keys(state.cooldowns)) state.cooldowns[id] = Math.max(0, state.cooldowns[id] - delta);
	state.saveTimer += delta;
	if (state.saveTimer >= 8) { state.saveTimer = 0; saveProgress(); }
	const worldDistance = Math.hypot(player.x, player.y);
	const worldAreaLevel = Math.min(99, Math.max(1, Math.floor(Math.max(0, worldDistance - safeSpawnRadius) / 350) + 1));
	const worldEnemyCap = Math.min(16, 4 + Math.floor(worldAreaLevel / 2));
	if (state.scene === "world" && (horizontal || vertical) && state.enemies.length < worldEnemyCap) {
		state.spawnTimer -= delta;
		if (state.spawnTimer <= 0) {
			state.spawnTimer = Math.max(1.4, 8.5 - worldAreaLevel * 0.55) + Math.random() * 2.5;
			const angle = Math.random() * Math.PI * 2; const distance = 250 + Math.random() * 170;
			const spawnX = player.x + Math.cos(angle) * distance; const spawnY = player.y + Math.sin(angle) * distance;
			const areaLevel = Math.min(99, Math.max(1, Math.floor(Math.max(0, Math.hypot(spawnX, spawnY) - safeSpawnRadius) / 450) + 1));
			const biome = getBiome(spawnX, spawnY);
			const regionEnemies = {
				forest: ["slime", "goblin", "bat", "wolf", "spider", "briarling"],
				highlands: ["skeleton", "wolf", "stone_golem", "ice_wraith", "cultist"],
				frost: ["ice_wraith", "frost_lich", "wolf", "stone_golem"],
				ember: ["fire_imp", "ember_drake", "magma_golem", "ash_wraith"],
				storm: ["storm_hawk", "thunder_golem", "storm_wraith", "sky_serpent"],
				marsh: ["briarling", "spider", "drowned", "tide_siren", "moss_troll"],
				desert: ["sand_scorpion", "mirage_wisp", "dune_raider", "sand_wyrm"],
				crystal: ["crystal_golem", "prism_wisp", "cave_moth", "shard_beast"],
				coast: ["reef_crab", "coral_keeper", "reef_witch", "drowned"],
				jungle: ["vine_stalker", "jungle_troll", "canopy_wyrm", "briarling"],
			};
			const types = regionEnemies[biome];
			const type = types[Math.floor(Math.random() * types.length)];
			const spawnLevel = Math.min(99, Math.max(areaLevel, player.level) + Math.floor(Math.random() * 3));
			if (!isInsideSafeSpawn(spawnX, spawnY) && !isTreeBlocked(spawnX, spawnY)) spawnEnemy(type, spawnX, spawnY, spawnLevel);
		}
	}
	updateEnemies(delta);
	updateProjectiles(delta);
	collectDrops();
	state.floating = state.floating.filter((text) => (text.life -= delta) > 0);
	state.attacks = state.attacks.filter((attack) => (attack.life -= delta) > 0);
	const nearby = getInteraction();
	interactionHint.textContent = nearby ? nearby.text.replace(/^E · /, touchLayout.matches ? "TOQUE · " : "E · ") : "";
	interactionHint.hidden = !nearby;
	positionLabel.textContent = state.scene === "dungeon"
		? `${dungeons[state.dungeonId].label} · ${state.room} / 12`
		: `X ${Math.round(player.x / tileSize)} · Y ${Math.round(player.y / tileSize)}`;
	renderHud();
}

function renderHud() {
	const player = state.player; const stats = getStats();
	const biomeNames = { forest: "BOSQUE VERDE", highlands: "TERRAS ALTAS", frost: "GELEIRAS DO NORTE", ember: "TERRAS DAS BRASAS", storm: "CUME DA TEMPESTADE", marsh: "BREJO DAS MARÉS", desert: "DESERTO ANTIGO", crystal: "VALE PRISMÁTICO", coast: "COSTA DOS RECIFES", jungle: "SELVA ANCESTRAL" };
	const areaLevel = Math.min(99, Math.max(1, Math.floor(Math.max(0, Math.hypot(player.x, player.y) - safeSpawnRadius) / 350) + 1));
	biomeLabel.textContent = state.scene === "world" ? `${biomeNames[getBiome(player.x, player.y)]} · NV. ${areaLevel}` : `${dungeons[state.dungeonId].label} · MASMORRA`;
	document.querySelector("#level-label").textContent = `NV. ${player.level}`;
	document.querySelector("#identity-label").textContent = player.classId ? `${player.name} · ${displayName(classes[player.classId])}` : "VIAJANTE";
	document.querySelector("#coin-label").textContent = `◆ ${player.coins}`;
	document.querySelector("#health-label").textContent = `${Math.ceil(player.hp)} / ${stats.maxHp}`;
	document.querySelector("#mana-label").textContent = `${Math.floor(player.mp)} / ${stats.maxMp}`;
	document.querySelector("#health-fill").style.width = `${Math.max(0, player.hp / stats.maxHp * 100)}%`;
	document.querySelector("#mana-fill").style.width = `${Math.max(0, player.mp / stats.maxMp * 100)}%`;
	document.querySelector("#xp-fill").style.width = `${player.xp / player.nextXp * 100}%`;
	const effects = player.status.filter((effect) => effect.type !== "guard").map((effect) => effect.type.toUpperCase());
	if (player.raceId === "vampire") effects.unshift(stats.night ? "NOITE · FORTE" : "DIA · FRÁGIL");
	document.querySelector("#effect-label").textContent = effects.join(" · ");
	for (const button of document.querySelectorAll("[data-cast]")) {
		const id = button.dataset.cast;
		if (id === "attack") { button.disabled = !state.started; continue; }
		if (id === "potion") {
			const available = player.inventory.some((itemId) => items[itemId]?.heal);
			button.querySelector("span").textContent = `Poção · ${player.inventory.filter((itemId) => items[itemId]?.heal).length}`;
			button.disabled = !state.started || !available || player.hp >= stats.maxHp;
			continue;
		}
		const slot = Number(id.replace("slot", ""));
		const skillId = state.equippedSkills[slot - 1];
		const info = skillInfo[skillId];
		button.querySelector("span").textContent = info?.name || `Hab. ${slot}`;
		button.title = info?.description || "";
		button.disabled = !state.started || !info || !state.skills.includes(skillId) || player.mp < info.cost || state.cooldowns[skillId] > 0;
	}
}

function usePotion(index) {
	const player = state.player;
	const itemId = player.inventory[index]; const item = items[itemId];
	if (!item || (!item.heal && !item.mana)) return false;
	const stats = getStats();
	const healing = Math.min(stats.maxHp - player.hp, item.heal || 0);
	const mana = Math.min(stats.maxMp - player.mp, item.mana || 0);
	if (!healing && !mana) { showToast("Seus pontos já estão cheios."); return false; }
	player.hp += healing; player.mp += mana;
	player.inventory.splice(index, 1);
	showToast(`${item.name} usado.`);
	return true;
}

function useQuickPotion() {
	const player = state.player;
	const index = player.inventory
		.map((id, itemIndex) => ({ id, itemIndex }))
		.filter(({ id }) => items[id]?.heal)
		.sort((a, b) => items[b.id].heal - items[a.id].heal)[0]?.itemIndex;
	if (index === undefined) { showToast("Você não tem poções de cura."); return; }
	if (usePotion(index)) { renderHud(); if (state.panel) renderPanel(); saveProgress(); }
}

function openPanel(mode) {
	state.panel = mode; panel.classList.toggle("inventory-panel", mode === "inventory"); panel.hidden = false; renderPanel();
}

function closePanel() { state.panel = null; panel.hidden = true; }

function itemStats(item) {
	const values = [];
	if (item.damage) values.push(`+${item.damage} ataque`);
	if (item.magic) values.push(`+${item.magic} magia`);
	if (item.defense) values.push(`+${item.defense} defesa`);
	if (item.hp) values.push(`+${item.hp} PV`);
	if (item.mp) values.push(`+${item.mp} PM`);
	const attributes = { strength: "força", vitality: "vitalidade", intelligence: "inteligência", agility: "agilidade", magicPower: "poder mágico", bowSkill: "pontaria" };
	for (const [key, name] of Object.entries(attributes)) if (item[key]) values.push(`+${item[key]} ${name}`);
	for (const [element, value] of Object.entries(item.resistances || {})) values.push(`+${Math.round(value * 100)}% resistência a ${elementNames[element] || element}`);
	for (const [element, value] of Object.entries(item.elementalDamage || {})) values.push(`+${Math.round(value * 100)}% dano de ${elementNames[element] || element}`);
	if (item.heal) values.push(`recupera ${item.heal} PV`);
	if (item.mana) values.push(`recupera ${item.mana} PM`);
	return values.join(" · ") || item.type;
}

function getItemColor(item) {
	const colors = { Comum: "#94a38c", Incomum: "#72ba8b", Raro: "#78b8e4", Épico: "#bd95ed", Lendário: "#efc96e" };
	return item?.color || colors[item?.rarity] || colors.Comum;
}

function itemIconSvg(itemId) {
	const item = items[itemId];
	if (!item) return "";
	const color = getItemColor(item);
	let art = "";
	if (item.heal || item.mana) art = `<path d="M25 14h14v7l6 7v22a5 5 0 0 1-5 5H25a5 5 0 0 1-5-5V28l5-7z" fill="${color}" fill-opacity=".26" stroke="${color}" stroke-width="3"/><path d="M24 37h16M32 29v16" stroke="#f4efd8" stroke-width="3" stroke-linecap="round"/>`;
	else if (item.type === "Material") art = `<path d="M32 8 51 20v23L32 56 13 43V20z" fill="${color}" fill-opacity=".2" stroke="${color}" stroke-width="3"/><path d="m32 14 4 16-11 5 7 15 13-9-5-16z" fill="${color}" stroke="#f4efd8" stroke-opacity=".65" stroke-width="2" stroke-linejoin="round"/>`;
	else if (item.slot === "weapon" && /bow|arco/i.test(itemId)) art = `<path d="M43 10Q11 32 43 54M43 10Q31 32 43 54" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/><path d="M20 32h28m0 0-8-7m8 7-8 7" fill="none" stroke="#f4efd8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
	else if (item.slot === "weapon" && /staff|cajado|cetro|bast[aã]o|lyre|lute/i.test(`${itemId} ${item.name}`)) art = `<path d="M20 51 43 14" stroke="${color}" stroke-width="5" stroke-linecap="round"/><path d="M42 8 46 17l-8 2-3-7z" fill="${color}" stroke="#f4efd8" stroke-width="2"/><circle cx="42" cy="12" r="3" fill="#fff3c1"/>`;
	else if (item.slot === "weapon" && /spear|tridente|lan[cç]a/i.test(`${itemId} ${item.name}`)) art = `<path d="M21 53 39 15" stroke="#c49a5d" stroke-width="4" stroke-linecap="round"/><path d="m40 8 11 8-12 8-5-8z" fill="${color}" stroke="#f4efd8" stroke-width="2"/>`;
	else if (item.slot === "weapon") art = `<path d="m42 9 10 5-18 25-7 4 2-9z" fill="${color}" stroke="#f4efd8" stroke-width="2.5" stroke-linejoin="round"/><path d="m20 44 10 7m-14-1 10-10m4 8-8 8" fill="none" stroke="#d7bb82" stroke-width="4" stroke-linecap="round"/>`;
	else if (item.slot === "shield") art = `<path d="M32 8 50 15v15c0 12-7 20-18 27-11-7-18-15-18-27V15z" fill="${color}" fill-opacity=".32" stroke="${color}" stroke-width="3"/><path d="m32 16 1 32m-12-19h23" stroke="#f4efd8" stroke-width="3" stroke-linecap="round"/>`;
	else if (item.slot === "helmet") art = `<path d="M13 38a19 19 0 0 1 38 0v7H13z" fill="${color}" fill-opacity=".3" stroke="${color}" stroke-width="3"/><path d="M11 45h42M32 20v14" stroke="#f4efd8" stroke-width="3" stroke-linecap="round"/>`;
	else if (item.slot === "armor") art = `<path d="m22 13 10-5 10 5 11 8-6 13-6-4v24H23V30l-6 4-6-13z" fill="${color}" fill-opacity=".28" stroke="${color}" stroke-width="3" stroke-linejoin="round"/><path d="M32 12v39m-9-16h18" stroke="#f4efd8" stroke-width="2" stroke-opacity=".8"/>`;
	else if (item.slot === "boots" || item.slot === "pants") art = `<path d="M18 11h12v24l-4 9H12a4 4 0 0 1 0-8h6zm16 0h12v25l5 4v5H35l-1-8z" fill="${color}" fill-opacity=".32" stroke="${color}" stroke-width="3" stroke-linejoin="round"/><path d="M18 33h12m4 0h12" stroke="#f4efd8" stroke-width="2"/>`;
	else if (item.slot === "gloves1" || item.slot === "gloves2") art = `<path d="M22 50 15 34a3 3 0 0 1 5-3l5 6-4-18a3 3 0 0 1 6-1l4 14V14a3 3 0 0 1 6 0v17l3-10a3 3 0 0 1 6 2l-3 19-8 9z" fill="${color}" fill-opacity=".28" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>`;
	else if (item.slot === "necklace" || item.slot === "charm") art = `<path d="M17 15q15 31 30 0" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/><path d="m32 36 8 8-8 11-8-11z" fill="${color}" stroke="#f4efd8" stroke-width="2"/>`;
	else if (item.slot === "bracelet1" || item.slot === "bracelet2") art = `<ellipse cx="32" cy="32" rx="14" ry="21" fill="${color}" fill-opacity=".25" stroke="${color}" stroke-width="5"/><path d="m30 11 6 5-5 5" fill="none" stroke="#fff3c1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
	else if (item.slot === "belt") art = `<path d="M11 22h42v20H11z" fill="${color}" fill-opacity=".28" stroke="${color}" stroke-width="3"/><path d="M27 27h11v10H27z" fill="none" stroke="#f4efd8" stroke-width="3"/><path d="M12 32h15m11 0h14" stroke="${color}" stroke-width="3"/>`;
	else art = `<circle cx="32" cy="32" r="19" fill="${color}" fill-opacity=".2" stroke="${color}" stroke-width="3"/><path d="m32 16 5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="${color}" stroke="#f4efd8" stroke-width="2" stroke-linejoin="round"/>`;
	return `<svg viewBox="0 0 64 64" role="img" aria-label="${item.name}" xmlns="http://www.w3.org/2000/svg">${art}</svg>`;
}

function row(title, detail, actions = "", itemId = null) {
	const icon = itemId ? `<span class="item-row-icon">${itemIconSvg(itemId)}</span>` : "";
	return `<div class="panel-row${itemId ? " item-row" : ""}">${icon}<div class="row-copy"><strong>${title}</strong><small>${detail}</small></div><div class="row-actions">${actions}</div></div>`;
}

function actionButton(action, id, label, disabled = false) {
	return `<button class="panel-button" type="button" data-action="${action}" data-id="${id}" ${disabled ? "disabled" : ""}>${label}</button>`;
}

function inventoryCount(itemId) {
	return state.player.inventory.filter((id) => id === itemId).length;
}

function canCraft(itemId) {
	const recipe = craftingRecipes[itemId];
	return Boolean(recipe && Object.entries(recipe.materials).every(([material, amount]) => inventoryCount(material) >= amount));
}

function renderInventory() {
	const player = state.player;
	const leftSlots = ["helmet", "weapon", "shield", "armor", "gloves1", "gloves2"];
	const rightSlots = ["pants", "boots", "necklace", "belt", "bracelet1", "bracelet2"];
	const slotMarkup = (slot) => {
		const label = equipmentSlots.find(([key]) => key === slot)[1];
		const id = player.equipment[slot];
		return `<div class="equipment-slot"><small>${label}</small>${id ? `<span class="equipment-icon">${itemIconSvg(id)}</span>` : ""}<strong>${id ? items[id].name : "Vazio"}</strong>${id ? actionButton("unequip", slot, "Tirar") : ""}</div>`;
	};
	const inventory = player.inventory.length ? player.inventory.map((id, index) => {
		const item = items[id];
		const allowed = canEquip(item);
		const action = item.heal || item.mana ? actionButton("use", String(index), "Usar") : item.slot && allowed ? actionButton("equip", String(index), "Equipar") : "";
		const restriction = item.slot && !allowed ? " · Não utilizável por esta classe; venda ao comprador" : "";
		return `<article class="inventory-item" data-rarity="${item.rarity}"><span class="item-art">${itemIconSvg(id)}</span><div class="inventory-item-copy"><strong>${item.name}</strong><small>${item.rarity} · ${itemStats(item)}${restriction}</small><div class="item-actions">${action}${actionButton("sell", String(index), "Vender")}</div></div></article>`;
	}).join("") : `<p class="panel-intro">Mochila vazia. Explore e derrote inimigos para encontrar itens.</p>`;
	panelContent.innerHTML = `<p class="panel-intro">Equipamentos mudam seus atributos. Os espaços vazios ficam disponíveis para novas peças. Poções podem ser usadas durante o combate.</p><div class="equipment-board"><div class="equipment-side">${leftSlots.map(slotMarkup).join("")}</div><canvas class="inventory-character" id="inventory-character" width="160" height="190" aria-label="Seu personagem equipado"></canvas><div class="equipment-side">${rightSlots.map(slotMarkup).join("")}</div></div><h3 class="inventory-heading">ITENS NA MOCHILA · ${player.inventory.length}</h3><div class="inventory-grid">${inventory}</div>`;
	const character = document.querySelector("#inventory-character");
	const characterContext = character.getContext("2d");
	drawHero(characterContext, 80, 154, 2.5, player.appearance, player.raceId, player.classId, player.equipment.armor, "down", player.equipment.helmet, player.equipment.shield, player.equipment);
}

function renderPanel() {
	const mode = state.panel; const player = state.player;
	const titles = { character: "PERSONAGEM", inventory: "MOCHILA", skills: "HABILIDADES", quests: "DIÁRIO", vendor: "MERCADOR", buyer: "COMPRADOR", crafting: "FORJA" };
	panelTitle.textContent = titles[mode] || "MENU";
	if (mode === "character") {
		const stats = getStats();
		const names = { strength: "Força", vitality: "Vitalidade", intelligence: "Inteligência", agility: "Agilidade", magicPower: "Poder mágico", bowSkill: "Pontaria" };
		const elementDetail = player.classId === "mage" ? ` · Elemento: ${mageElements[player.element].name}` : "";
		panelContent.innerHTML = `<p class="panel-intro">${displayName(races[player.raceId])} · ${displayName(classes[player.classId])}${elementDetail}. Raça e classe são permanentes. Nível ${player.level} · ${player.xp} / ${player.nextXp} XP · ${player.statPoints} pontos de atributo livres.</p>${Object.entries(names).map(([id, name]) => row(name, id === "strength" ? `${Math.round(stats.attack)} dano físico` : id === "vitality" ? `${stats.maxHp} PV máximos · ${stats.defense} defesa` : id === "intelligence" ? `${stats.maxMp} PM máximos` : id === "agility" ? `${Math.round(stats.speed)} velocidade` : id === "magicPower" ? `${Math.round(stats.magic)} dano mágico` : `${Math.round(stats.bowAttack)} dano de arco`, `<span class="stat-value">${stats.attributes[id]}</span>${actionButton("stat", id, "+", player.statPoints < 1)}`)).join("")}`;
	} else if (mode === "inventory") {
		renderInventory();
	} else if (mode === "skills") {
		const skillRows = (ids, source) => ids.map((id) => {
			const skill = skillInfo[id];
			const learned = state.skills.includes(id);
			const equippedSlot = state.equippedSkills.indexOf(id);
			const canLearn = player.level >= skill.level && player.skillPoints > 0;
			const button = !learned ? actionButton("learn", id, `Aprender · NV. ${skill.level}`, !canLearn)
				: equippedSlot >= 0 ? actionButton("unequipSkill", id, `Tirar · ${equippedSlot + 1}`)
					: actionButton("equipSkill", id, "Equipar", state.equippedSkills.length >= 5);
			const skillSource = skill.race ? displayName(races[skill.race]) : source;
			return row(skill.name, `${skillSource} · ${skill.description} Custo: ${skill.cost} PM · Recarga: ${skill.cooldown}s.`, button);
		}).join("");
		const classSkillIds = player.classId === "mage"
			? mageElements[player.element].skills
			: classes[player.classId].skills;
		const classSkillRows = skillRows(classSkillIds, "Classe");
		const racialSkills = availableSkillIds().filter((id) => skillInfo[id].race);
		const racialSkillRows = skillRows(racialSkills, "Técnica racial");
		const mageElement = player.classId === "mage" ? ` Elemento: ${mageElements[player.element].name}.` : "";
		panelContent.innerHTML = `<p class="panel-intro">${displayName(classes[player.classId])} · ${player.skillPoints} pontos.${mageElement} Aprenda técnicas disponíveis e equipe até 5 (${state.equippedSkills.length}/5). Use as teclas 1–5.</p><p class="panel-intro">HABILIDADES DA CLASSE</p>${classSkillRows}<p class="panel-intro">HABILIDADES RACIAIS${player.classId === "mage" ? " COMPATÍVEIS" : " DE TODAS AS RAÇAS"}</p>${racialSkillRows}`;
	} else if (mode === "quests") {
		const dungeonList = Object.values(dungeons).map((dungeon) => `${dungeon.name} (${elementNames[dungeon.element]}): 12 andares, entrada em X ${Math.round(dungeon.x / tileSize)} · Y ${Math.round(dungeon.y / tileSize)}`).join(" · ");
		panelContent.innerHTML = `<p class="panel-intro">REGISTRO DE EXPLORAÇÃO · Biomas distantes trazem mais inimigos, mais fortes e com melhores materiais. Masmorras têm 12 andares; os chefes e tesouros mais raros estão nas regiões mais perigosas.</p>${row("Inimigos", `${state.quests.kills} derrotados · ${state.quests.bosses} chefes derrotados`, "")}${row("Masmorras", dungeonList, "")}${row("Próximo nível", `${player.nextXp - player.xp} XP restantes`, "")}${row("Forja", "Reúna materiais de monstros e visite a forja perto do ponto inicial para criar equipamentos e poções.", "")}`;
	} else if (mode === "crafting") {
		const recipes = Object.entries(craftingRecipes).map(([itemId, recipe]) => {
			const ingredients = Object.entries(recipe.materials).map(([material, amount]) => `${items[material].name} ${inventoryCount(material)}/${amount}`).join(" · ");
			const item = items[itemId];
			return row(item.name, `${item.rarity} · ${itemStats(item)} · Materiais: ${ingredients}`, actionButton("craft", itemId, "Fabricar", !canCraft(itemId)), itemId);
		}).join("");
		panelContent.innerHTML = `<p class="panel-intro">Use materiais coletados de monstros para criar armas, roupas, acessórios e poções. As receitas conhecidas estão disponíveis aqui.</p>${recipes}`;
	} else if (mode === "vendor") {
		const goods = Object.entries(items).filter(([, item]) => item.cost > 0 && item.type !== "Material");
		panelContent.innerHTML = `<p class="panel-intro">Equipamentos de outras classes podem ser comprados e revendidos, mas não equipados. Ouro: ◆ ${player.coins}.</p>${goods.map(([id, item]) => {
			return row(item.name, `${item.rarity} · ${itemStats(item)} · ◆ ${item.cost}`, actionButton("buy", id, "Comprar", player.coins < item.cost), id);
		}).join("")}`;
	} else if (mode === "buyer") {
		const sellable = player.inventory.map((id, index) => ({ id, index }));
		panelContent.innerHTML = `<p class="panel-intro">Vendo os itens que você carrega por metade do valor de mercado.</p>${sellable.length ? sellable.map(({ id, index }) => row(items[id].name, `${itemStats(items[id])} · recebe ◆ ${Math.max(1, Math.floor(items[id].cost * 0.5))}`, actionButton("sell", String(index), "Vender"), id)).join("") : `<p class="panel-intro">Você não tem itens para vender.</p>`}`;
	}
}

function performPanelAction(action, id) {
	const player = state.player;
	if (action === "stat" && player.statPoints > 0) { player.stats[id] += 1; player.statPoints -= 1; showToast("Atributo aprimorado."); }
	if (action === "learn" && availableSkillIds().includes(id) && !state.skills.includes(id) && player.level >= skillInfo[id].level && player.skillPoints > 0) {
		state.skills.push(id); player.skillPoints -= 1;
		if (state.equippedSkills.length < 5) { state.equippedSkills.push(id); showToast(`${skillInfo[id].name} aprendida e equipada.`); }
		else showToast(`${skillInfo[id].name} aprendida. Desafie uma técnica para equipá-la.`);
	}
	if (action === "equipSkill" && state.skills.includes(id) && !state.equippedSkills.includes(id) && state.equippedSkills.length < 5) {
		state.equippedSkills.push(id); showToast(`${skillInfo[id].name} equipada.`);
	}
	if (action === "unequipSkill" && state.equippedSkills.includes(id)) {
		state.equippedSkills = state.equippedSkills.filter((skillId) => skillId !== id); showToast(`${skillInfo[id].name} removida dos espaços.`);
	}
	if (action === "buy") {
		const item = items[id];
		if (!item || player.coins < item.cost) return;
		player.coins -= item.cost; addItem(id); showToast(`${item.name} comprado.`);
	}
	if (action === "craft") {
		const recipe = craftingRecipes[id];
		if (!recipe || !items[id]) return;
		if (!canCraft(id)) { showToast("Faltam materiais para fabricar esse item."); return; }
		for (const [material, amount] of Object.entries(recipe.materials)) {
			for (let count = 0; count < amount; count += 1) player.inventory.splice(player.inventory.indexOf(material), 1);
		}
		addItem(id); showToast(`${items[id].name} fabricado.`);
	}
	if (action === "sell") {
		const index = Number(id); const itemId = player.inventory[index];
		if (itemId) {
			player.coins += Math.max(1, Math.floor(items[itemId].cost * 0.5)); player.inventory.splice(index, 1); showToast(`${items[itemId].name} vendido.`);
		}
	}
	if (action === "equip") {
		const index = Number(id); const itemId = player.inventory[index]; const item = items[itemId];
		const slot = getEquipmentSlot(item);
		if (slot && equipmentSlotKeys.includes(slot) && canEquip(item)) {
			const previous = player.equipment[slot];
			player.equipment[slot] = itemId; player.inventory.splice(index, 1);
			if (previous) player.inventory.push(previous);
			player.hp = Math.min(player.hp, getStats().maxHp); player.mp = Math.min(player.mp, getStats().maxMp); showToast(`${item.name} equipado.`);
		}
	}
	if (action === "unequip") {
		const itemId = player.equipment[id];
		if (itemId) { player.inventory.push(itemId); player.equipment[id] = null; player.hp = Math.min(player.hp, getStats().maxHp); player.mp = Math.min(player.mp, getStats().maxMp); }
	}
	if (action === "use") {
		usePotion(Number(id));
	}
	renderPanel(); renderHud();
	saveProgress();
}

function handleKeyDown(event) {
	if (!state.started) return;
	const key = event.key.toLowerCase();
	const direction = directions[event.key] || directions[key];
	if (direction) { event.preventDefault(); keys.add(direction); return; }
	if (event.repeat) return;
	if (event.code === "Space") { event.preventDefault(); castSkill("attack"); }
	if (key === "q") { event.preventDefault(); useQuickPotion(); }
	if (key === "e") { event.preventDefault(); interact(); }
	if (["1", "2", "3", "4", "5"].includes(key)) castSkill(`slot${key}`);
	if (key === "escape") closePanel();
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", (event) => {
	const direction = directions[event.key] || directions[event.key.toLowerCase()];
	if (direction) keys.delete(direction);
});
const fullscreenButton = document.querySelector("#fullscreen-button");
function updateFullscreenButton() {
	const active = document.fullscreenElement === document.documentElement;
	const label = active ? "Sair da tela cheia" : "Tela cheia";
	fullscreenButton.querySelector("span:last-child").textContent = label;
	fullscreenButton.setAttribute("aria-label", label);
	fullscreenButton.title = label;
}
fullscreenButton.addEventListener("click", async () => {
	if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) {
		showToast("Tela cheia não está disponível neste navegador.");
		return;
	}
	try {
		if (document.fullscreenElement) await document.exitFullscreen();
		else await document.documentElement.requestFullscreen();
	} catch {
		showToast("Não foi possível alterar o modo de tela cheia.");
	}
});
document.addEventListener("fullscreenchange", updateFullscreenButton);
window.addEventListener("blur", () => {
	keys.clear();
	resetJoystick();
});
window.addEventListener("resize", resizeCanvas);
document.querySelector("#reset-button").addEventListener("click", () => {
	if (!window.confirm("Resetar o personagem? Você perderá seu nível, itens, equipamentos e progresso. Poderá escolher outra raça e classe.")) return;
	try {
		localStorage.removeItem(saveKey);
	} catch {
		showToast("Não foi possível resetar o personagem neste navegador.");
		return;
	}
	state.scene = "world"; state.started = false; state.room = 0; state.dungeonId = null; state.returnPosition = null;
	state.dayTime = 0; state.quests = { kills: 0, bosses: 0 };
	state.player.x = 0; state.player.y = 0; state.player.level = 0; state.player.xp = 0; state.player.nextXp = 45;
	state.player.hp = 0; state.player.mp = 0; state.player.name = "Viajante";
	state.player.raceId = null; state.player.classId = null; state.player.element = null; state.player.appearance = "girl";
	state.player.coins = 0; state.player.stats = { strength: 3, vitality: 2, intelligence: 2, agility: 2, magicPower: 1, bowSkill: 1 };
	state.player.statPoints = 0; state.player.skillPoints = 0; state.player.inventory = [];
	state.player.equipment = createEquipment(); state.player.status = [];
	state.skills = []; state.equippedSkills = []; state.cooldowns = {};
	state.enemies = []; state.drops = []; state.floating = []; state.attacks = []; state.projectiles = [];
	selection.raceId = null; selection.classId = null; selection.element = null; selection.appearance = "girl";
	document.querySelector("#hero-name").value = "Viajante";
	document.querySelector("#creation-screen").hidden = false;
	keys.clear(); resetJoystick(); closePanel();
	renderHud(); updateCreation();
	showToast("Personagem resetado. Escolha uma nova raça e classe.");
});
document.querySelector("#close-panel").addEventListener("click", closePanel);
document.querySelectorAll("[data-panel]").forEach((button) => button.addEventListener("click", () => openPanel(button.dataset.panel)));
document.querySelectorAll("[data-cast]").forEach((button) => button.addEventListener("click", () => castSkill(button.dataset.cast)));
document.querySelector("#touch-attack").addEventListener("click", () => castSkill("attack"));
canvas.addEventListener("pointerdown", (event) => {
	if (!state.started || event.button !== 0) return;
	const bounds = canvas.getBoundingClientRect();
	basicAttackAt({
		x: state.player.x + event.clientX - bounds.left - viewWidth / 2,
		y: state.player.y + event.clientY - bounds.top - viewHeight / 2,
	});
});
document.querySelector("#interact-button")?.addEventListener("click", interact);
panelContent.addEventListener("click", (event) => {
	const button = event.target.closest("[data-action]");
	if (button && !button.disabled) performPanelAction(button.dataset.action, button.dataset.id);
});

function updateJoystick(event) {
	const bounds = moveJoystick.getBoundingClientRect();
	const centerX = bounds.left + bounds.width / 2;
	const centerY = bounds.top + bounds.height / 2;
	const maxOffset = bounds.width * 0.32;
	const dx = event.clientX - centerX;
	const dy = event.clientY - centerY;
	const distance = Math.hypot(dx, dy);
	const offset = Math.min(distance, maxOffset);
	const scale = distance ? offset / distance : 0;
	joystickKnob.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;

	const deadzone = maxOffset * 0.14;
	if (distance <= deadzone) {
		joystickAxes.x = 0;
		joystickAxes.y = 0;
		return;
	}
	const strength = (offset - deadzone) / (maxOffset - deadzone);
	joystickAxes.x = dx / distance * strength;
	joystickAxes.y = dy / distance * strength;
}

function resetJoystick() {
	joystickPointerId = null;
	joystickAxes.x = 0;
	joystickAxes.y = 0;
	joystickKnob.style.transform = "translate(0, 0)";
}

moveJoystick.addEventListener("pointerdown", (event) => {
	if (!state.started || joystickPointerId !== null) return;
	event.preventDefault();
	joystickPointerId = event.pointerId;
	moveJoystick.setPointerCapture(event.pointerId);
	updateJoystick(event);
});
moveJoystick.addEventListener("pointermove", (event) => {
	if (event.pointerId === joystickPointerId) updateJoystick(event);
});
for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) {
	moveJoystick.addEventListener(name, (event) => {
		if (event.pointerId === joystickPointerId) resetJoystick();
	});
}

function frame(timestamp) {
	const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0;
	lastFrame = timestamp;
	if (state.started) { update(delta); draw(); }
	requestAnimationFrame(frame);
}

new ResizeObserver(resizeCanvas).observe(canvas);
document.querySelectorAll("[data-race]").forEach((button) => button.addEventListener("click", () => { selection.raceId = button.dataset.race; if (!isElementAvailableForRace(selection.element, selection.raceId)) selection.element = null; updateCreation(); }));
document.querySelectorAll("[data-class]").forEach((button) => button.addEventListener("click", () => { selection.classId = button.dataset.class; selection.element = null; updateCreation(); }));
document.querySelectorAll("[data-element]").forEach((button) => button.addEventListener("click", () => { selection.element = button.dataset.element; updateCreation(); }));
document.querySelectorAll("[data-appearance]").forEach((button) => button.addEventListener("click", () => { selection.appearance = button.dataset.appearance; updateCreation(); }));
document.querySelector("#begin-adventure").addEventListener("click", beginAdventure);
const hasSave = loadProgress();
document.querySelector("#creation-screen").hidden = hasSave;
resizeCanvas(); renderHud(); updateCreation(); requestAnimationFrame(frame);