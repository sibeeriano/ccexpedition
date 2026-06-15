export type LocalizedText = {
  es: string;
  en: string;
};

export type NewsPost = {
  id: string;
  date: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText[];
};

/** Agregá entradas nuevas arriba (más reciente primero). */
export const NEWS_POSTS: NewsPost[] = [
  {
    id: "categorias-gasto",
    date: "2026-06-13",
    title: {
      es: "Categorías personalizables en cada gasto",
      en: "Custom categories on every expense",
    },
    excerpt: {
      es: "Etiquetá gastos nuevos o existentes con categorías que creás vos.",
      en: "Tag new or existing expenses with categories you create.",
    },
    body: [
      {
        es: "Al agregar o editar un gasto podés elegir una categoría — o crear una nueva en el momento. Supermercado, Viajes, Mascotas… lo que te sirva para ordenar.",
        en: "When adding or editing an expense you can pick a category — or create a new one on the spot. Groceries, Travel, Pets… whatever helps you stay organized.",
      },
      {
        es: "La categoría es opcional y queda guardada en cada gasto. Por ahora es para clasificar; más adelante la vamos a usar para reportes y filtros.",
        en: "The category is optional and saved on each expense. For now it's for classification; soon we'll use it for reports and filters.",
      },
    ],
  },
  {
    id: "ingreso-mensual",
    date: "2026-06-11",
    title: {
      es: "Ingreso mensual en la vista consolidada",
      en: "Monthly income in the consolidated view",
    },
    excerpt: {
      es: "Compará tus ingresos con el total de gastos mes a mes.",
      en: "Compare your income against monthly spending totals.",
    },
    body: [
      {
        es: "En la grilla de todas las tarjetas hay una fila nueva: Ingreso mensual. Por cada mes podés cargar cuánto ingreso mensual calculas para ese mes y ver cuánto te queda después de pagar todo. Da miedo.",
        en: "The all-cards grid now has a new row: Monthly income. For each month you can enter how much you think you'll earn and see what's left after covering everything. Scary.",
      },
      {
        es: "El resultado se actualiza solo si cambian los gastos del mes. Verde si te sobra, rojo si te falta.",
        en: "The result updates automatically when monthly spending changes. Green if you're ahead, red if you're short.",
      },
    ],
  },
  {
    id: "limite-gasto",
    date: "2026-06-08",
    title: {
      es: "Límite de gasto mensual",
      en: "Monthly spending limit",
    },
    excerpt: {
      es: "Renombramos la alerta de presupuesto para que sea más clara.",
      en: "We renamed the budget alert to make it clearer.",
    },
    body: [
      {
        es: "Lo que antes decía «Alerta de presupuesto mensual» ahora es «Límite de gasto mensual». La función es la misma: definís un tope y los meses que lo superen se resaltan.",
        en: "What used to say «Monthly budget alert» is now «Monthly spending limit». Same feature: set a cap and months that exceed it are highlighted.",
      },
    ],
  },
  {
    id: "bienvenida-beta",
    date: "2026-06-01",
    title: {
      es: "¡Bienvenido a la beta de ccExpedition!",
      en: "Welcome to the ccExpedition beta!",
    },
    excerpt: {
      es: "Gracias por probar la app desde el principio.",
      en: "Thanks for trying the app from day one.",
    },
    body: [
      {
        es: "Esta es la beta de ccExpedition: una forma simple de ver cuánto debés en cada tarjeta mes a mes, marcar pagos y proyectar cuotas.",
        en: "This is the ccExpedition beta: a simple way to see what you owe on each card month by month, mark payments, and project installments.",
      },
      {
        es: "Tu feedback nos ayuda a mejorar. Si encontrás algo raro, contanos desde Ajustes o por mail.",
        en: "Your feedback helps us improve. If something feels off, reach out from Settings or by email.",
      },
    ],
  },
];

export function getNewsPost(id: string): NewsPost | undefined {
  return NEWS_POSTS.find((post) => post.id === id);
}

export function getNewsPostsSorted(): NewsPost[] {
  return [...NEWS_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}
