import { NextApiRequest, NextApiResponse } from "next";

import crypto from "crypto";

import { env } from "~/env.mjs";

type Event = {
  id: string;
  event: string
  api_version: string
  created: string
  data: DealOfferPayload
}

type DealOfferPayload = {
  id: string
  dealId: string
  shippingType: "Schenker" | "Pickup"
  packageType: "Small"
  buyerName: string
  buyerEmail: string
  price: number
  buyerRedirectUrl: string
  sellerRedirectUrl: string
  date: number
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    const payload = JSON.parse(req.body) as Event;
    const signature = req.headers["treddy-signature"] as string | undefined;
  
    if (!signature) {
      res.status(400);
    }
  
    if (signature == null || !verifyHeader(req.body, signature)) {
      console.log("was bad");
      res.status(400).end();
      return
    }
  
    console.log(payload.event)
    console.log(payload.data)
  } catch (err) {
    console.log(err)
    res.status(400).end();
    return
  }

  res.status(200).json({
    success: true,
  });
  
  return
};

const getTimestamp = (signature: string) => {
  const items = signature.split(",", -1);

  for (const item of items) {
    const itemParts = item.split("=", 2);
    if (itemParts[0] === "t") {
      return Number(itemParts[1]);
    }
  }

  return -1;
};

const verifyHeader = (payload: string, header: string) => {
  const timestamp = getTimestamp(header);
  const signature = getSignature(header);

  const tolerance = 5000;

  if (timestamp <= 0 || signature == null) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  let expectedSignature;
  try {
    expectedSignature = computeHmacSha256(
      signedPayload,
      env.TREDDY_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(error)
    return false;
  }

  const isSignaturesEqual = secureCompare(expectedSignature, signature);

  if (
    !isSignaturesEqual ||
    (tolerance > 0 && timestamp < Date.now() - tolerance)
  ) {
    return false;
  }

  return true;
};

const getSignature = (signature: string) => {
  const items = signature.split(",", -1);

  for (const item of items) {
    const itemParts = item.split("=", 2);
    if (itemParts[0] === "s") {
      return itemParts[1];
    }
  }

  return null;
};

const computeHmacSha256 = (data: string, key: string) => {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(data);
  return hmac.digest("hex");
};

const secureCompare = (a: string, b: string) => {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};
