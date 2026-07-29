import type { Card } from "../types";

export function isMonthlyExpenseCard(card: Card): boolean {
  return card.isMonthlyExpense === true;
}

export function getRegularCards(cards: Card[]): Card[] {
  return cards.filter((card) => !isMonthlyExpenseCard(card));
}

export function getMonthlyExpenseCards(cards: Card[]): Card[] {
  return cards.filter(isMonthlyExpenseCard);
}
