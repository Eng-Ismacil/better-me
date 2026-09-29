import { connectToDatabase } from "@/lib/db";
import { getUserHabits } from "@/lib/habits";

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum" | "diamond" | "mythic";
export type BadgeCategory = "streaks" | "completions" | "finance" | "routines" | "wellness";

export interface AchievementItem {
  code: string;
  title: string;
  titleSo: string;
  description: string;
  descriptionSo: string;
  icon: string;
  tier: BadgeTier;
  category: BadgeCategory;
  categoryLabel: string;
  categoryLabelSo: string;
  xp: number;
  unlocked: boolean;
  progress: number; // 0 - 100
  targetText: string;
  targetTextSo: string;
  tip: string;
  tipSo: string;
}

export interface UserGamificationProfile {
  totalXp: number;
  level: number;
  levelTitle: string;
  levelTitleSo: string;
  currentLevelXp: number;
  nextLevelXp: number;
  levelProgressPct: number;
  unlockedCount: number;
  totalCount: number;
  achievements: AchievementItem[];
  stats: {
    habitsCount: number;
    totalCompletions: number;
    maxStreak: number;
    totalRoutines: number;
    totalSavedAmount: number;
    completedGoalsCount: number;
    totalCheckIns: number;
  };
}

const LEVELS = [
  { level: 1, minXp: 0, maxXp: 300, titleEn: "Novice Seeker", titleSo: "Bilaabe Cusub" },
  { level: 2, minXp: 300, maxXp: 800, titleEn: "Growth Initiate", titleSo: "Dhiirrigaliye Horumar" },
  { level: 3, minXp: 800, maxXp: 1600, titleEn: "Momentum Builder", titleSo: "Dhisaha Dardarka" },
  { level: 4, minXp: 1600, maxXp: 2800, titleEn: "Consistency Master", titleSo: "Sayidka Joogteynta" },
  { level: 5, minXp: 2800, maxXp: 4500, titleEn: "Discipline Champion", titleSo: "Horyaalka Anshaxa" },
  { level: 6, minXp: 4500, maxXp: 7000, titleEn: "Iron Will Titan", titleSo: "Geesiga Awoodda Birta" },
  { level: 7, minXp: 7000, maxXp: 12000, titleEn: "Mythic Sovereign", titleSo: "Halyeeyga Sare" },
];

export async function calculateUserAchievements(userId: string): Promise<UserGamificationProfile> {
  const { db } = await connectToDatabase();

  const [
    habits,
    totalCompletions,
    routines,
    savingsTransactions,
    goals,
    totalCheckIns,
  ] = await Promise.all([
    getUserHabits(userId),
    db.collection("habitCompletions").countDocuments({ userId }),
    db.collection("routines").find({ userId }).toArray(),
    db
      .collection("financeTransactions")
      .find({ userId, type: "saving", deletedAt: { $in: [null, undefined] } })
      .toArray(),
    db.collection("savingsGoals").find({ userId }).toArray(),
    db.collection("dailyCheckIns").countDocuments({ userId }),
  ]);

  const habitsCount = habits.length;
  const maxStreak = habits.reduce(
    (acc, h) => Math.max(acc, h.bestStreak || 0, h.currentStreak || 0),
    0
  );
  const totalRoutines = routines.length;
  const hasMultiHabitRoutine = routines.some((r) => (r.habits || []).length >= 3);
  const hasMorningRoutine = routines.some((r) =>
    (r.timeOfDay || "").toLowerCase().includes("morn")
  );

  const totalSavedAmount = savingsTransactions.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );
  const completedGoalsCount = goals.filter(
    (g) => Number(g.savedAmount || 0) >= Number(g.targetAmount || 1)
  ).length;

  const rawAchievements: AchievementItem[] = [
    // ── 1. STREAKS & MOMENTUM (DARDAR & JOOGTEYN) ──
    {
      code: "first_habit",
      title: "First Step",
      titleSo: "Tallaabadii Ugu Horreysay",
      description: "Created your very first habit to begin your transformational journey",
      descriptionSo: "Waxaad abuurtay caadadaadii ugu horreysay si aad u bilowdo socdaalkaaga",
      icon: "flag",
      tier: "bronze",
      category: "streaks",
      categoryLabel: "Streaks",
      categoryLabelSo: "Dardar",
      xp: 100,
      unlocked: habitsCount >= 1,
      progress: Math.min(100, habitsCount * 100),
      targetText: `${Math.min(1, habitsCount)}/1 habit created`,
      targetTextSo: `${Math.min(1, habitsCount)}/1 caado la abuuray`,
      tip: "Creating habits clarifies your daily priorities.",
      tipSo: "Abuurista caadooyin waxay kuu qeexaysaa waxyaabaha mudnaanta kuu leh.",
    },
    {
      code: "streak_3",
      title: "Ignition Spark",
      titleSo: "Dhimbiishii Bilowga",
      description: "Maintained an unbroken 3-day streak showing early discipline",
      descriptionSo: "Joogtee caado 3 maalmood oo xiriir ah si aad u kiciso dardar",
      icon: "bolt",
      tier: "bronze",
      category: "streaks",
      categoryLabel: "Streaks",
      categoryLabelSo: "Dardar",
      xp: 150,
      unlocked: maxStreak >= 3,
      progress: Math.min(100, Math.round((maxStreak / 3) * 100)),
      targetText: `${Math.min(3, maxStreak)}/3 days streak`,
      targetTextSo: `${Math.min(3, maxStreak)}/3 maalmood xiriir ah`,
      tip: "The first 3 days are where new neural pathways begin forming.",
      tipSo: "3-da maalmood ee hore waa halka ay ka bilaabato dhisidda dabeecad cusub.",
    },
    {
      code: "streak_7",
      title: "7-Day Momentum",
      titleSo: "Joogteyn 7-Maalmood ah",
      description: "Achieved a full unbroken 7-day habit streak with focus",
      descriptionSo: "Dhammaystir usbuuc buuxa oo xiriir ah adigoo dhisaya awooddaada",
      icon: "local_fire_department",
      tier: "silver",
      category: "streaks",
      categoryLabel: "Streaks",
      categoryLabelSo: "Dardar",
      xp: 250,
      unlocked: maxStreak >= 7,
      progress: Math.min(100, Math.round((maxStreak / 7) * 100)),
      targetText: `${Math.min(7, maxStreak)}/7 days streak`,
      targetTextSo: `${Math.min(7, maxStreak)}/7 maalmood xiriir ah`,
      tip: "One full week builds undeniable rhythm and confidence.",
      tipSo: "Usbuuc buuxa oo joogto ah wuxuu dhisayaa isku-kalsooni dhab ah.",
    },
    {
      code: "streak_14",
      title: "Fortnight Focus",
      titleSo: "Xoogga 14-ka Maalmood",
      description: "Sustained a disciplined 14-day streak without missing a day",
      descriptionSo: "Dhis xiriir adag oo 14 maalmood ah adiga oo aan hal maalin seegin",
      icon: "verified",
      tier: "silver",
      category: "streaks",
      categoryLabel: "Streaks",
      categoryLabelSo: "Dardar",
      xp: 400,
      unlocked: maxStreak >= 14,
      progress: Math.min(100, Math.round((maxStreak / 14) * 100)),
      targetText: `${Math.min(14, maxStreak)}/14 days streak`,
      targetTextSo: `${Math.min(14, maxStreak)}/14 maalmood xiriir ah`,
      tip: "At 14 days, the habit begins feeling natural and automatic.",
      tipSo: "Markaad gaarto 14 maalmood, caadadu waxay noqonaysaa mid sahlan oo dabiici ah.",
    },
    {
      code: "streak_30",
      title: "Monthly Mastery",
      titleSo: "Xirfadda Bishii (Mastery)",
      description: "A monumental 30-day streak cementing lifestyle transformation",
      descriptionSo: "30 maalmood oo joogto ah oo beddelay nolol-maalmeedkaaga",
      icon: "military_tech",
      tier: "gold",
      category: "streaks",
      categoryLabel: "Streaks",
      categoryLabelSo: "Dardar",
      xp: 750,
      unlocked: maxStreak >= 30,
      progress: Math.min(100, Math.round((maxStreak / 30) * 100)),
      targetText: `${Math.min(30, maxStreak)}/30 days streak`,
      targetTextSo: `${Math.min(30, maxStreak)}/30 maalmood xiriir ah`,
      tip: "You have crossed the threshold of identity change.",
      tipSo: "Waxaad ka gudubtay marxaladda isbeddelka shakhsiyadda ee dhabta ah.",
    },
    {
      code: "streak_60",
      title: "Unshakeable Habit",
      titleSo: "Caado Aan La Jabin Karin (60d)",
      description: "Solidified automatic behavior through a 60-day unbroken streak",
      descriptionSo: "60 maalmood oo joogto ah oo caadada ka dhigtay mid aan laga tegi karin",
      icon: "workspace_premium",
      tier: "platinum",
      category: "streaks",
      categoryLabel: "Streaks",
      categoryLabelSo: "Dardar",
      xp: 1400,
      unlocked: maxStreak >= 60,
      progress: Math.min(100, Math.round((maxStreak / 60) * 100)),
      targetText: `${Math.min(60, maxStreak)}/60 days streak`,
      targetTextSo: `${Math.min(60, maxStreak)}/60 maalmood xiriir ah`,
      tip: "Scientific studies show 66 days is the peak habit automation window.",
      tipSo: "Cilmibaaristu waxay muujisaa in 66 maalmood ay tahay halka caadadu ku dhabowdo.",
    },
    {
      code: "streak_100",
      title: "Centurion Titan",
      titleSo: "Halyeeyga 100-ka Maalmood",
      description: "An elite 100-day consecutive streak achieved by the top 1% of achievers",
      descriptionSo: "100 maalmood oo xiriir ah oo ay gaaraan kaliya 1% dadka ugu anshaxa adag",
      icon: "hotel_class",
      tier: "diamond",
      category: "streaks",
      categoryLabel: "Streaks",
      categoryLabelSo: "Dardar",
      xp: 2500,
      unlocked: maxStreak >= 100,
      progress: Math.min(100, Math.round((maxStreak / 100) * 100)),
      targetText: `${Math.min(100, maxStreak)}/100 days streak`,
      targetTextSo: `${Math.min(100, maxStreak)}/100 maalmood xiriir ah`,
      tip: "You belong to the elite tier of disciplined individuals.",
      tipSo: "Waxaad ka mid noqotay heerka ugu sarreeya ee dadka nolosha maamusha.",
    },

    // ── 2. COMPLETIONS VOLUME (DHAMMAYSTIRKA GUUD) ──
    {
      code: "comp_1",
      title: "First Victory",
      titleSo: "Guushii Koowaad",
      description: "Completed your first habit checkmark in the app",
      descriptionSo: "Waxaad calaamadsatay guushii ugu horreysay ee caado la qabtay",
      icon: "check_circle",
      tier: "bronze",
      category: "completions",
      categoryLabel: "Completions",
      categoryLabelSo: "Dhammaystir",
      xp: 50,
      unlocked: totalCompletions >= 1,
      progress: Math.min(100, totalCompletions * 100),
      targetText: `${Math.min(1, totalCompletions)}/1 completion`,
      targetTextSo: `${Math.min(1, totalCompletions)}/1 dhammaystir`,
      tip: "Every journey begins with a single completed action.",
      tipSo: "Socdaal kasta wuxuu ka bilaabmaa hal tallaabo oo la qaaday.",
    },
    {
      code: "comp_25",
      title: "Quarter Century",
      titleSo: "25 Dhammaystir",
      description: "Reached 25 cumulative habit checkmarks",
      descriptionSo: "Gaar 25 guulood oo caadooyin la dhammaystiray ah",
      icon: "task_alt",
      tier: "silver",
      category: "completions",
      categoryLabel: "Completions",
      categoryLabelSo: "Dhammaystir",
      xp: 200,
      unlocked: totalCompletions >= 25,
      progress: Math.min(100, Math.round((totalCompletions / 25) * 100)),
      targetText: `${Math.min(25, totalCompletions)}/25 completions`,
      targetTextSo: `${Math.min(25, totalCompletions)}/25 dhammaystir`,
      tip: "Consistency stacks up into remarkable momentum.",
      tipSo: "Tallaabooyinka yaryar waxay isku biirsadaan guul aad u weyn.",
    },
    {
      code: "comp_100",
      title: "Centurion Ritual",
      titleSo: "100 Guulood oo Dhammaystiran",
      description: "Accumulated 100 total habit completions across your rituals",
      descriptionSo: "Waxaad xaqiijisay 100 jeer oo caadooyin la qabtay",
      icon: "stars",
      tier: "gold",
      category: "completions",
      categoryLabel: "Completions",
      categoryLabelSo: "Dhammaystir",
      xp: 600,
      unlocked: totalCompletions >= 100,
      progress: Math.min(100, Math.round((totalCompletions / 100) * 100)),
      targetText: `${Math.min(100, totalCompletions)}/100 completions`,
      targetTextSo: `${Math.min(100, totalCompletions)}/100 dhammaystir`,
      tip: "A true habit powerhouse with 100 triumphs behind you.",
      tipSo: "Waxaad tahay qof run ahaantii guulo la taaban karo gaaray.",
    },
    {
      code: "comp_250",
      title: "Habit Virtuoso",
      titleSo: "250 Dhammaystir oo Heersare ah",
      description: "Hit 250 habit actions completed with dedication",
      descriptionSo: "Xaqiiji 250 jeer oo caadooyin nololeed la dhammaystiray",
      icon: "military_tech",
      tier: "platinum",
      category: "completions",
      categoryLabel: "Completions",
      categoryLabelSo: "Dhammaystir",
      xp: 1250,
      unlocked: totalCompletions >= 250,
      progress: Math.min(100, Math.round((totalCompletions / 250) * 100)),
      targetText: `${Math.min(250, totalCompletions)}/250 completions`,
      targetTextSo: `${Math.min(250, totalCompletions)}/250 dhammaystir`,
      tip: "You have built ironclad reliability and focus.",
      tipSo: "Waxaad dhistay anshax adag oo aad ku tiirsanaan karto.",
    },
    {
      code: "comp_500",
      title: "Living Legend",
      titleSo: "Halyeeyga 500 Guulood",
      description: "Earned 500 habit completions cementing personal greatness",
      descriptionSo: "500 jeer oo aad caadooyinkaaga guuleysatay — maqaam halyeey",
      icon: "diamond",
      tier: "mythic",
      category: "completions",
      categoryLabel: "Completions",
      categoryLabelSo: "Dhammaystir",
      xp: 2500,
      unlocked: totalCompletions >= 500,
      progress: Math.min(100, Math.round((totalCompletions / 500) * 100)),
      targetText: `${Math.min(500, totalCompletions)}/500 completions`,
      targetTextSo: `${Math.min(500, totalCompletions)}/500 dhammaystir`,
      tip: "Few people ever reach this level of commitment.",
      tipSo: "Dad aad u yar ayaa abid gaara heerkan adkaysiga ah.",
    },

    // ── 3. FINANCIAL DISCIPLINE & SAVINGS (KAYDKA & MAALIYADDA) ──
    {
      code: "fin_first_save",
      title: "Wealth Builder",
      titleSo: "Dhisaha Hantida (First Save)",
      description: "Logged your first intentional savings deposit into your reserve vault",
      descriptionSo: "Waxaad diiwaangelisay lacagtii ugu horreysay ee aad kaydka dhigato",
      icon: "savings",
      tier: "bronze",
      category: "finance",
      categoryLabel: "Finance & Wealth",
      categoryLabelSo: "Maaliyad & Kayd",
      xp: 150,
      unlocked: totalSavedAmount > 0,
      progress: totalSavedAmount > 0 ? 100 : 0,
      targetText: totalSavedAmount > 0 ? "First deposit saved" : "0/1 savings entry",
      targetTextSo: totalSavedAmount > 0 ? "Kaydkii koowaad waa la dhigay" : "Dhig lacag kayd ah",
      tip: "Saving money is paying your future self first.",
      tipSo: "Kaydinta lacagtu waa abaalmarinta ugu weyn ee mustaqbalkaaga.",
    },
    {
      code: "fin_save_100",
      title: "Century Vault",
      titleSo: "Qasnadda $100+",
      description: "Accumulated over $100 in your personal savings reserve",
      descriptionSo: "Keydi $100 ama ka badan oo lacag kayd ah sanduuqaaga",
      icon: "account_balance",
      tier: "silver",
      category: "finance",
      categoryLabel: "Finance & Wealth",
      categoryLabelSo: "Maaliyad & Kayd",
      xp: 350,
      unlocked: totalSavedAmount >= 100,
      progress: Math.min(100, Math.round((totalSavedAmount / 100) * 100)),
      targetText: `$${Math.min(100, Math.round(totalSavedAmount))}/$100 saved`,
      targetTextSo: `$${Math.min(100, Math.round(totalSavedAmount))}/$100 la keydsaday`,
      tip: "Reaching triple-digit savings proves your financial discipline.",
      tipSo: "Inaad gaarto $100+ oo kayd ah waxay caddaynaysaa go'aankaaga maaliyadeed.",
    },
    {
      code: "fin_save_500",
      title: "Capital Fortress",
      titleSo: "Qalcadda Hantida $500+",
      description: "Protected and saved $500+ towards emergency resilience and assets",
      descriptionSo: "Keydi $500+ oo hanti ah si aad u hesho ammaan maaliyadeed oo buuxa",
      icon: "shield",
      tier: "gold",
      category: "finance",
      categoryLabel: "Finance & Wealth",
      categoryLabelSo: "Maaliyad & Kayd",
      xp: 800,
      unlocked: totalSavedAmount >= 500,
      progress: Math.min(100, Math.round((totalSavedAmount / 500) * 100)),
      targetText: `$${Math.min(500, Math.round(totalSavedAmount))}/$500 saved`,
      targetTextSo: `$${Math.min(500, Math.round(totalSavedAmount))}/$500 la keydsaday`,
      tip: "An emergency buffer of $500 shields you against unexpected life shocks.",
      tipSo: "$500 oo kayd ahi waxay kaa difaacaysaa dhibaatooyinka lama filaanka ah.",
    },
    {
      code: "fin_goal_reached",
      title: "Goal Conqueror",
      titleSo: "Guuleystaha Yoolka Kaydka",
      description: "Fully achieved 100% of at least one dedicated savings target",
      descriptionSo: "Gaar 100% ugu yaraan hal yool oo kayd ah oo aad dejisay",
      icon: "emoji_events",
      tier: "platinum",
      category: "finance",
      categoryLabel: "Finance & Wealth",
      categoryLabelSo: "Maaliyad & Kayd",
      xp: 1200,
      unlocked: completedGoalsCount >= 1,
      progress: Math.min(100, completedGoalsCount * 100),
      targetText: `${Math.min(1, completedGoalsCount)}/1 goal completed`,
      targetTextSo: `${Math.min(1, completedGoalsCount)}/1 yool la gaaray`,
      tip: "Setting and hitting financial goals transforms dreams into assets.",
      tipSo: "Dejinta iyo gaaritaanka yoolalka maaliyadeed waxay riyada u beddeshaa hanti.",
    },

    // ── 4. DAILY FLOW & ROUTINES (RUTIINADA & NIDAAMKA) ──
    {
      code: "routine_builder",
      title: "Flow Architect",
      titleSo: "Dhisaha Nidaamka (Routines)",
      description: "Constructed your first daily habit routine stack",
      descriptionSo: "Waxaad dhistay rutiinkaagii koowaad ee caadooyinka isku xiran",
      icon: "auto_stories",
      tier: "bronze",
      category: "routines",
      categoryLabel: "Routines",
      categoryLabelSo: "Rutiinada",
      xp: 150,
      unlocked: totalRoutines >= 1,
      progress: Math.min(100, totalRoutines * 100),
      targetText: `${Math.min(1, totalRoutines)}/1 routine created`,
      targetTextSo: `${Math.min(1, totalRoutines)}/1 rutiin la abuuray`,
      tip: "Habit stacking removes decision fatigue from your days.",
      tipSo: "Isku xirka caadooyinku wuxuu kaa qaadaa daalka fikirka badan.",
    },
    {
      code: "morning_master",
      title: "Sunrise Champion",
      titleSo: "Geesiga Subaxda",
      description: "Designed a dedicated Morning routine to seize the first hours of the day",
      descriptionSo: "Samee rutiin subaxeed si aad maalinta ugu bilowdo awood iyo firfircooni",
      icon: "wb_sunny",
      tier: "silver",
      category: "routines",
      categoryLabel: "Routines",
      categoryLabelSo: "Rutiinada",
      xp: 300,
      unlocked: hasMorningRoutine,
      progress: hasMorningRoutine ? 100 : 0,
      targetText: hasMorningRoutine ? "Morning routine active" : "0/1 Morning routine",
      targetTextSo: hasMorningRoutine ? "Rutiinka subaxda waa firfircoon" : "Samee rutiin subaxeed",
      tip: "Own your morning, own your day.",
      tipSo: "Haddii aad subaxdaada hanato, waxaad hanteen maalintaada oo dhan.",
    },
    {
      code: "habit_stacker",
      title: "Master Stacker",
      titleSo: "Sayidka Isku-xirka (3+ Habits)",
      description: "Linked 3 or more complementary habits into a single seamless flow",
      descriptionSo: "Isku xir 3 ama wax ka badan oo caadooyin ah hal rutiin gudihiis",
      icon: "layers",
      tier: "gold",
      category: "routines",
      categoryLabel: "Routines",
      categoryLabelSo: "Rutiinada",
      xp: 500,
      unlocked: hasMultiHabitRoutine,
      progress: hasMultiHabitRoutine ? 100 : totalRoutines > 0 ? 50 : 0,
      targetText: hasMultiHabitRoutine ? "3+ habits chained" : "0/3 habits in 1 routine",
      targetTextSo: hasMultiHabitRoutine ? "3+ caadooyin ayaa isku xiran" : "Ku dar 3 caado hal rutiin",
      tip: "Chaining habits together creates an automated superpower.",
      tipSo: "Isku xirka taxanaha ah ee caadooyinku wuxuu abuuraa nidaam aan la loodin karin.",
    },

    // ── 5. MINDFULNESS & REFLECTION (QIIMEYNTA & IS-DARYEELKA) ──
    {
      code: "checkin_1",
      title: "Self-Awareness",
      titleSo: "Is-fahamka & Is-qiimeynta",
      description: "Logged your first mindful daily mood and energy check-in",
      descriptionSo: "Waxaad diiwaangelisay qiimeyntaadii koowaad ee dareenka iyo tamarta",
      icon: "ecg_heart",
      tier: "bronze",
      category: "wellness",
      categoryLabel: "Mind & Wellness",
      categoryLabelSo: "Maskaxda & Caafimaadka",
      xp: 100,
      unlocked: totalCheckIns >= 1,
      progress: Math.min(100, totalCheckIns * 100),
      targetText: `${Math.min(1, totalCheckIns)}/1 check-in`,
      targetTextSo: `${Math.min(1, totalCheckIns)}/1 qiimeyn maalinle`,
      tip: "Awareness of your mood and energy is the bedrock of growth.",
      tipSo: "Ogaanshaha dareenkaaga iyo tamartaadu waa aasaaska horumarka.",
    },
    {
      code: "checkin_7",
      title: "Mindful Clarity",
      titleSo: "Xasillooni 7-Maalmood ah",
      description: "Completed 7 daily reflections discovering your energy rhythms",
      descriptionSo: "Dhammaystir 7 qiimeyn maalinle ah oo ku saabsan niyaddaada",
      icon: "psychology",
      tier: "silver",
      category: "wellness",
      categoryLabel: "Mind & Wellness",
      categoryLabelSo: "Maskaxda & Caafimaadka",
      xp: 300,
      unlocked: totalCheckIns >= 7,
      progress: Math.min(100, Math.round((totalCheckIns / 7) * 100)),
      targetText: `${Math.min(7, totalCheckIns)}/7 check-ins`,
      targetTextSo: `${Math.min(7, totalCheckIns)}/7 qiimeyn`,
      tip: "Tracking energy reveals what fuels you and what drains you.",
      tipSo: "La socoshada tamartaadu waxay kuu sheegaysaa waxa ku farxadgeliya.",
    },
    {
      code: "checkin_30",
      title: "Inner Peace Sage",
      titleSo: "Sayidka Nabadda Gudaha",
      description: "Accumulated 30 mindful reflections establishing profound self-mastery",
      descriptionSo: "30 maalmood oo qiimeyn ah oo gaarsiisay maankaaga degganaansho buuxa",
      icon: "self_improvement",
      tier: "gold",
      category: "wellness",
      categoryLabel: "Mind & Wellness",
      categoryLabelSo: "Maskaxda & Caafimaadka",
      xp: 800,
      unlocked: totalCheckIns >= 30,
      progress: Math.min(100, Math.round((totalCheckIns / 30) * 100)),
      targetText: `${Math.min(30, totalCheckIns)}/30 check-ins`,
      targetTextSo: `${Math.min(30, totalCheckIns)}/30 qiimeyn`,
      tip: "Reflective minds navigate challenges with unshakable poise.",
      tipSo: "Qofka is-qiimeeya wuxuu caqabadaha kaga gudbaa xasillooni adag.",
    },
  ];

  // Calculate Total XP from unlocked items
  const totalXp = rawAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xp, 0);

  // Compute Current Level
  let currentLevelObj = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].minXp) {
      currentLevelObj = LEVELS[i];
      break;
    }
  }

  const currentLevelXp = totalXp - currentLevelObj.minXp;
  const levelSpan = currentLevelObj.maxXp - currentLevelObj.minXp;
  const levelProgressPct = Math.min(
    100,
    Math.max(0, Math.round((currentLevelXp / levelSpan) * 100))
  );

  const unlockedCount = rawAchievements.filter((a) => a.unlocked).length;

  return {
    totalXp,
    level: currentLevelObj.level,
    levelTitle: currentLevelObj.titleEn,
    levelTitleSo: currentLevelObj.titleSo,
    currentLevelXp,
    nextLevelXp: currentLevelObj.maxXp,
    levelProgressPct,
    unlockedCount,
    totalCount: rawAchievements.length,
    achievements: rawAchievements,
    stats: {
      habitsCount,
      totalCompletions,
      maxStreak,
      totalRoutines,
      totalSavedAmount,
      completedGoalsCount,
      totalCheckIns,
    },
  };
}
