export type GiftProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  shipped: boolean;
};

// Fans buy something the athlete makes or signs, so each sale promotes a real product sold to
// the public, which is what NIL rules ask for. The athlete's share is a planning assumption.
export const ATHLETE_SHARE_PERCENT = 70;

export const giftProducts: GiftProduct[] = [
  {
    id: "shout-out",
    name: "Personal video shout-out",
    price: 30,
    description: "A 30-second video for a birthday, a team or a big day.",
    shipped: false,
  },
  {
    id: "signed-card",
    name: "Signed photo card",
    price: 25,
    description: "A 5×7 photo card signed by the athlete, mailed to you.",
    shipped: true,
  },
  {
    id: "meet-greet",
    name: "Post-meet meet and greet",
    price: 40,
    description: "Five minutes and a photo with the athlete after a home meet.",
    shipped: false,
  },
];

export function findProduct(id: string) {
  return giftProducts.find((product) => product.id === id);
}

export function athleteShare(amount: number) {
  return Math.round(amount * ATHLETE_SHARE_PERCENT) / 100;
}

// Official school giving. It funds the department, not a chosen athlete's NIL.
export const SCHOOL_GIVING_URL = "https://utahcrimsonclub.com/";
