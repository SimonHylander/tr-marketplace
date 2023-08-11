export type ApiClient = {
  oauth2: () => OAuth2Client;
  deals: () => DealClient;
};

export type OAuth2Client = {
  getAccessToken: () => Promise<AccessToken | null>;
};

export type AccessToken = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
};

export type PingResponse = string;

export type DealClient = {
  v1: () => {
    list: (accessToken: string) => Promise<Deal[]>;

    get: (accessToken: string, id: string) => Promise<Deal | null>;

    create: (
      accessToken: string,
      deal: CreateDealPayload
    ) => Promise<Deal | null>;

    offer: (
      accessToken: string,
      dealId: string,
      payload: DealOfferPayload
    ) => Promise<DealOfferResponse | null>;
  };
  /* v1_1: () => {
    list: (accessToken: string) => Promise<Deal[]>;

    get: (accessToken: string, id: string) => Promise<Deal | null>;

    create: (
      accessToken: string,
      deal: CreateDealPayload
    ) => Promise<Deal | null>;

    setShippingType: (
      accessToken: string,
      dealId: string,
      payload: SetShippingTypePayload
    ) => Promise<Deal | null>;

    offer: (
      accessToken: string,
      dealId: string,
      payload: DealOfferPayload
    ) => Promise<SetShippingTypeResponse | null>;
  }; */
};

export type ApiError = {
  message: string;
  status: string;
};

export type Deal = {
  id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  url: string;
};

export type CreateDealPayload = {
  name: string;
  description: string;
  price: number;
  images?: string[];
  packageType?: string;
  seller?: {
    firstname?: string;
    lastname?: string;
    phone?: string;
    email?: string;
    postcode?: string;
    town?: string;
  };
};

export type SetShippingTypePayload = {
  type: "Pickup" | "Schenker";
};

export type SetShippingTypeResponse = {
  id: string;
  dealId: string;
  type: "Pickup" | "Schenker";
  packageType: string;
};

export type DealOfferPayload = {
  buyer: {
    name: string;
    email: string;
  };
  communication?: {
    email?: {
      send?: boolean;
      originator: string;
    };
  };
  buyerRedirectUrl: string;
  sellerRedirectUrl: string;
};

export type DealOfferResponse = {
  url: string;
};
