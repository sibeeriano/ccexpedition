export type LocalizedText = {
  es: string;
  en: string;
};

export type NewsImage = {
  src: string;
  alt: LocalizedText;
  caption?: LocalizedText;
  /** Insert after this body paragraph index (0-based). */
  afterParagraph: number;
};

export type NewsPost = {
  id: string;
  date: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText[];
  images?: NewsImage[];
};

/** Agregá entradas nuevas arriba (más reciente primero). */
export const NEWS_POSTS: NewsPost[] = [
  {
    id: "tema-liquid-glass",
    date: "2026-07-08",
    title: {
      es: "Tema Liquid Glass",
      en: "Liquid Glass theme",
    },
    excerpt: {
      es: "Estilo macOS 27: paneles translúcidos, blur suave y acento azul sistema.",
      en: "macOS 27 style: translucent panels, soft blur, and system blue accent.",
    },
    body: [
      {
        es: "En Perfil, Personalizar, elegi Liquid Glass. Inspirado en el UI Kit de macOS 27: fondo lavanda-gris, paneles con vidrio esmerilado, bordes claros y sombra suave.",
        en: "In Profile, Personalize, pick Liquid Glass. Inspired by the macOS 27 UI Kit: lavender-gray background, frosted-glass panels, light borders, and soft shadows.",
      },
      {
        es: "Los botones usan azul sistema, las pestanas son pasteles translúcidas y los chips de tarjetas llevan blur. El navbar tambien queda con efecto glass.",
        en: "Buttons use system blue, tabs are translucent pastels, and card chips get blur. The navbar also gets the glass treatment.",
      },
      {
        es: "Los colores del workspace quedan fijos en este tema, salvo la columna de tarjetas en la grilla. Lo seguimos puliendo: si algo no cierra visualmente, contanos.",
        en: "Workspace colors are fixed in this theme, except the card column in the grid. We are still polishing it — if something looks off, let us know.",
      },
    ],
  },
  {
    id: "tema-neobrutalism",
    date: "2026-07-04",
    title: {
      es: "Tema Neobrutalism",
      en: "Neobrutalism theme",
    },
    excerpt: {
      es: "Fondo claro, bordes negros gruesos, sombras duras y pestañas de colores. Un look neobrutalista para la app.",
      en: "Light background, thick black borders, hard shadows, and colorful tabs. A neobrutalist look for the app.",
    },
    body: [
      {
        es: "En Perfil → Personalizar elegí Neobrutalism como tema visual. Inspirado en neobrutalism.dev: paneles blancos sobre fondo lavanda, bordes de 2px negros y sombra dura desplazada (sin blur).",
        en: "In Profile → Personalize pick Neobrutalism as your visual theme. Inspired by neobrutalism.dev: white panels on a lavender background, 2px black borders, and a hard offset shadow (no blur).",
      },
      {
        es: "Las pestañas del workspace tienen colores distintos (amarillo, verde, celeste y rosa), los chips de tarjetas llevan el mismo estilo, y la grilla consolidada también tiene borde y sombra. El logo del navbar gana una sombra para verse sobre el fondo claro.",
        en: "Workspace tabs use different colors (yellow, green, blue, and pink), card chips match the style, and the consolidated grid gets a border and shadow too. The navbar logo gets a shadow so it stays visible on the light background.",
      },
      {
        es: "Los colores del workspace quedan fijos en este tema, salvo la columna de tarjetas en la vista consolidada, que podés seguir ajustando. Como el retro Win95, lo seguimos puliendo: si algo no cierra visualmente, contanos.",
        en: "Workspace colors are fixed in this theme, except the card column in the consolidated view, which you can still customize. Like the Win95 retro theme, we're still polishing it — if something looks off, let us know.",
      },
    ],
  },
  {
    id: "tema-retro-win95",
    date: "2026-07-03",
    title: {
      es: "Tema retro Windows 95",
      en: "Windows 95 retro theme",
    },
    excerpt: {
      es: "Interfaz gris, bordes clásicos y scrollbars al estilo Win95. Todavía lo estamos puliendo.",
      en: "Gray UI, classic borders, and Win95-style scrollbars. We're still polishing it.",
    },
    body: [
      {
        es: "En Perfil → Personalizar elegí Retro (Windows 95) como tema visual. La interfaz pasa a grises clásicos, bordes en relieve y tipografía de sistema.",
        en: "In Profile → Personalize pick Retro (Windows 95) as your visual theme. The UI switches to classic grays, raised borders, and system typography.",
      },
      {
        es: "Incluye scrollbars al estilo Windows 95, chips de tarjetas en grises distintos y una columna de grilla más oscura por defecto. Los colores del workspace quedan fijos en retro, salvo la columna de tarjetas en la vista consolidada, que podés seguir ajustando.",
        en: "It includes Win95-style scrollbars, card chips in different grays, and a darker default grid column. Workspace colors are fixed in retro, except the card column in the consolidated view, which you can still customize.",
      },
      {
        es: "Este tema está en proceso de mejorar: algunas pantallas pueden verse inconsistentes y vamos sumando detalles en próximas actualizaciones. Si algo te choca visualmente, contanos — tu feedback ayuda a priorizar qué pulir.",
        en: "This theme is still being improved: some screens may look inconsistent and we'll keep adding polish in upcoming updates. If something looks off, let us know — your feedback helps us prioritize what to refine.",
      },
    ],
  },
  {
    id: "conversion-usd-cotizacion",
    date: "2026-07-02",
    title: {
      es: "Conversión USD→ARS con cotización del día",
      en: "USD→ARS conversion with daily exchange rate",
    },
    excerpt: {
      es: "Elegí oficial, tarjeta o blue, consultá la cotización en Perfil y mirá cómo se ven los montos dentro de cada tarjeta.",
      en: "Pick official, card, or blue rate, check today's quote in Profile, and see how amounts look inside each card.",
    },
    body: [
      {
        es: "En Perfil → Datos podés elegir el tipo de cambio (oficial, tarjeta o blue), ver la cotización del día con compra y venta desde ArgentinaDatos, y activar la conversión de USD a pesos en toda la app.",
        en: "In Profile → Data you can pick the exchange rate (official, card, or blue), see today's buy and sell rates from ArgentinaDatos, and enable USD→peso conversion across the app.",
      },
      {
        es: "Dentro de cada tarjeta, los gastos en dólares muestran el monto mensual en USD en «Este mes» y el equivalente en pesos en «Total ARS» — sin paréntesis en la cuota. La vista consolidada y el resto de la app siguen mostrando la conversión entre paréntesis junto al dólar.",
        en: "Inside each card, dollar expenses show the monthly USD amount under «This month» and the peso equivalent under «Total ARS» — no parentheses on the installment. The consolidated view and the rest of the app still show the conversion in parentheses next to the dollar amount.",
      },
      {
        es: "También sumamos la fila Saldo debajo de Ingreso mensual en la grilla: el ingreso queda como lo cargás vos y el saldo muestra cuánto te queda después de restar la deuda del mes.",
        en: "We also added a Balance row below Monthly income in the grid: income stays as you enter it, and balance shows what's left after subtracting that month's debt.",
      },
    ],
    images: [
      {
        src: "/news/cotizacion-dolar-perfil.png",
        afterParagraph: 0,
        alt: {
          es: "Perfil → Datos: selector de cotización oficial, tarjeta o blue con compra, venta y fecha del día.",
          en: "Profile → Data: official, card, or blue rate selector with buy, sell, and date.",
        },
        caption: {
          es: "Perfil → Datos: tipo de cambio y cotización del día.",
          en: "Profile → Data: exchange rate type and daily quote.",
        },
      },
      {
        src: "/news/detalle-tarjeta-usd.png",
        afterParagraph: 1,
        alt: {
          es: "Detalle de tarjeta: Spotify en USD con cuota mensual en dólares y total convertido a pesos en la columna Total ARS.",
          en: "Card detail: Spotify in USD with monthly installment in dollars and converted total in the Total ARS column.",
        },
        caption: {
          es: "Dentro de cada tarjeta: USD en «Este mes» y pesos en «Total ARS».",
          en: "Inside each card: USD under «This month» and pesos under «Total ARS».",
        },
      },
    ],
  },
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
