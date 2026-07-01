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
  image?: {
    src: string;
    alt: LocalizedText;
  };
};

/** Agregá entradas nuevas arriba (más reciente primero). */
export const NEWS_POSTS: NewsPost[] = [
  {
    id: "cuotas-idioma-historial",
    date: "2026-07-01",
    title: {
      es: "Cuotas más fáciles, español por defecto y más historial",
      en: "Easier installments, Spanish by default, and more history",
    },
    excerpt: {
      es: "Cargá gastos en cuotas con el monto del resumen, la app arranca en español y podés elegir hasta 2 años atrás.",
      en: "Enter installment amounts from your statement, the app defaults to Spanish, and you can pick dates up to 2 years back.",
    },
    body: [
      {
        es: "Al agregar o editar un gasto en cuotas, ahora podés completar el total de la compra o el monto de cada cuota. Si ponés la cuota y la cantidad, el total se calcula solo — ideal cuando tenés el resumen del banco a mano.",
        en: "When adding or editing an installment expense, you can fill in either the purchase total or each installment amount. If you enter the installment and the count, the total is calculated automatically — handy when you have your bank statement in front of you.",
      },
      {
        es: "La app ahora abre en español por defecto (si no elegiste otro idioma en Perfil). Y al elegir el mes de inicio de un gasto o al importar un Excel, podés ir hasta 2 años hacia atrás en lugar de 1.",
        en: "The app now opens in Spanish by default (unless you already picked another language in Profile). When choosing a start month for an expense or importing Excel, you can go up to 2 years back instead of 1.",
      },
    ],
    image: {
      src: "/news/cuotas-bidireccionales.png",
      alt: {
        es: "Formulario de gasto en cuotas: podés cargar el total o el monto por cuota y se sincronizan solos.",
        en: "Installment expense form: enter the total or each installment amount and they sync automatically.",
      },
    },
  },
  {
    id: "vista-perfil",
    date: "2026-06-17",
    title: {
      es: "Perfil: personalización, tarjetas y cuenta",
      en: "Profile: personalization, cards, and account",
    },
    excerpt: {
      es: "Una vista nueva para ajustar la app, tus tarjetas y tu cuenta en un solo lugar.",
      en: "A new view to manage app settings, your cards, and your account in one place.",
    },
    body: [
      {
        es: "Desde el link Perfil (junto a Novedades y Tablero) accedés a todo lo que antes estaba repartido en Ajustes: colores, título, columna de la grilla, moneda de alerta y opciones de visualización. Cada sección es una tarjeta que podés expandir.",
        en: "From the Profile link (next to News and Dashboard) you get everything that used to live in Settings: colors, title, grid column, alert currency, and display options. Each section is a card you can expand.",
      },
      {
        es: "También podés editar o eliminar tarjetas, exportar tus gastos en CSV, repetir cualquier tutorial, cambiar contraseña, elegir idioma, activar «Mantener sesión» o eliminar tu cuenta. El ícono de engranaje ya no está: todo quedó acá.",
        en: "You can also edit or delete cards, export expenses as CSV, replay any tutorial, change your password, pick a language, toggle «Keep signed in», or delete your account. The gear icon is gone — it's all here now.",
      },
      {
        es: "Hay ejemplos en vivo para el título, la alerta de presupuesto y el color de la columna de tarjetas, así ves el cambio antes de guardar.",
        en: "There are live previews for the title, budget alert, and all-cards column color, so you see changes before saving.",
      },
    ],
  },
  {
    id: "app-instalable",
    date: "2026-06-15",
    title: {
      es: "ccExpedition como app en tu teléfono",
      en: "ccExpedition as a phone app",
    },
    excerpt: {
      es: "Ahora podés instalar la web en tu pantalla de inicio, como una app.",
      en: "You can now install the site on your home screen, like an app.",
    },
    body: [
      {
        es: "ccExpedition ahora se puede instalar en Android e iOS. Agregá el ícono de la app a la pantalla de inicio para una experiencia más práctica.",
        en: "ccExpedition can now be installed on Android and iOS. Add the app icon to your home screen for a more practical experience.",
      },
      {
        es: "Android (Chrome): abrís la web y aparece un banner abajo que dice «Agregar a pantalla de inicio» o un ícono de instalar en la barra de direcciones. También podés ir a los tres puntitos y marcar «Agregar a la pantalla de inicio». Aparecerá el ícono de la app en el inicio o cajón de aplicaciones.",
        en: "Android (Chrome): open the site and a banner at the bottom says «Add to Home screen», or look for the install icon in the address bar. You can also open the three-dot menu and tap «Add to Home screen». The app icon will show up on your home screen or app drawer.",
      },
      {
        es: "iOS (Safari): no aparece un banner automático. Tenés que ir manualmente a Compartir (el cuadradito con la flecha) → «Agregar a pantalla de inicio». Es un paso más, pero funciona igual.",
        en: "iOS (Safari): there's no automatic banner. Go to Share (the square with the arrow) → «Add to Home Screen». One extra step, but it works the same.",
      },
    ],
  },
  {
    id: "tablero-dashboard",
    date: "2026-06-14",
    title: {
      es: "Tablero: gastos por categoría",
      en: "Dashboard: spending by category",
    },
    excerpt: {
      es: "Una vista nueva para ver cuánto gastaste por categoría cada mes.",
      en: "A new view to see how much you spent per category each month.",
    },
    body: [
      {
        es: "Desde el link Tablero (al lado de Novedades) podés ver todos tus gastos del mes agrupados por categoría, en todas las tarjetas a la vez. Elegís el mes en un desplegable para no llenar la pantalla de datos.",
        en: "From the Dashboard link (next to News) you can see all monthly spending grouped by category across every card at once. Pick the month from a dropdown so the screen stays readable.",
      },
      {
        es: "Arriba hay un gráfico de torta con el reparto por categoría; abajo, el detalle desplegable de cada una con sus gastos. Lo que no tiene categoría aparece como «Otros gastos».",
        en: "Up top there's a pie chart breaking down each category; below, collapsible sections list every expense. Anything without a category shows up as «Other expenses».",
      },
    ],
  },
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
