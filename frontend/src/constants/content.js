import { TEAL, TEAL_LIGHT, AMBER, AMBER_LIGHT, CORAL, CORAL_LIGHT } from "./colors";

export const NAV_LINKS = ['nav.features', 'nav.howItWorks', 'nav.editor'];

export const FEATURES = [
  {
    icon: "🔊",
    color: TEAL_LIGHT,
    accent: TEAL,
    title: 'home.features.items.0.title',
    desc: 'home.features.items.0.desc',
  },
  {
    icon: "✏️",
    color: AMBER_LIGHT,
    accent: AMBER,
    title: 'home.features.items.1.title',
    desc: 'home.features.items.1.desc',
  },
  {
    icon: "🔤",
    color: CORAL_LIGHT,
    accent: CORAL,
    title: 'home.features.items.2.title',
    desc: 'home.features.items.2.desc',
  },
  {
    icon: "🎙️",
    color: "#EAF3DE",
    accent: "#639922",
    title: 'home.features.items.3.title',
    desc: 'home.features.items.3.desc',
  },
  {
    icon: "🔮",
    color: "#E6F1FB",
    accent: "#185FA5",
    title: 'home.features.items.4.title',
    desc: 'home.features.items.4.desc',
  },
  {
    icon: "🎛️",
    color: "#EEEDFE",
    accent: "#534AB7",
    title: 'home.features.items.5.title',
    desc: 'home.features.items.5.desc',
  },
];

export const STEPS = [
  {
    n: "1",
    title: 'home.steps.0.title',
    desc: 'home.steps.0.desc',
    color: TEAL,
    bg: TEAL_LIGHT,
  },
  {
    n: "2",
    title: 'home.steps.1.title',
    desc: 'home.steps.1.desc',
    color: AMBER,
    bg: AMBER_LIGHT,
  },
  {
    n: "3",
    title: 'home.steps.2.title',
    desc: 'home.steps.2.desc',
    color: CORAL,
    bg: CORAL_LIGHT,
  },
];

export const AUDIENCES = [
  {
    emoji: "🧒",
    label: 'home.audiences.0.label',
    age: 'home.audiences.0.age',
    color: AMBER,
    bg: AMBER_LIGHT,
    points: [
      'home.audiences.0.points.0',
      'home.audiences.0.points.1',
      'home.audiences.0.points.2',
      'home.audiences.0.points.3',
    ],
  },
  {
    emoji: "🧑‍💼",
    label: 'home.audiences.1.label',
    age: 'home.audiences.1.age',
    color: TEAL,
    bg: TEAL_LIGHT,
    points: [
      'home.audiences.1.points.0',
      'home.audiences.1.points.1',
      'home.audiences.1.points.2',
      'home.audiences.1.points.3',
    ],
  },
];

export const TESTIMONIALS = [
  {
    name: "Fatima B.",
    role: 'home.testimonials.items.0.role',
    avatar: "FB",
    color: AMBER,
    bg: AMBER_LIGHT,
    text: 'home.testimonials.items.0.text',
  },
  {
    name: "Ahmed K.",
    role: 'home.testimonials.items.1.role',
    avatar: "AK",
    color: TEAL,
    bg: TEAL_LIGHT,
    text: 'home.testimonials.items.1.text',
  },
  {
    name: "Sonia M.",
    role: 'home.testimonials.items.2.role',
    avatar: "SM",
    color: CORAL,
    bg: CORAL_LIGHT,
    text: 'home.testimonials.items.2.text',
  },
];

export const STATS = [
  { val: 15, suffix: "%", label: 'home.stats.0.label', color: TEAL },
  { val: 94, suffix: "%", label: 'home.stats.1.label', color: AMBER },
  { val: 50, suffix: "k+", label: 'home.stats.2.label', color: CORAL },
];
