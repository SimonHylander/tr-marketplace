import { env } from "~/env.mjs";

import base64 from "base-64";

import {
  AccessToken,
  DealOfferPayload,
  CreateDealPayload,
  Deal,
  DealClient,
  OAuth2Client,
  SetShippingTypePayload,
  DealOfferResponse,
  SetShippingTypeResponse,
  ApiError,
} from "./types";

export const TreddyEnv = {
  client_id: env.TREDDY_CLIENT_ID,
  client_secret: env.TREDDY_CLIENT_ID,
  treddy_env: env.TREDDY_ENV,
  sandbox_uri: "https://sandbox.treddy.se",
  production_uri: "https://api.treddy.se",
};

export class TreddyApiClientConfiguration {
  client_id: string;
  client_secret: string;
  treddy_env: string;
  base_uri: string;

  constructor(client_id: string, client_secret: string, treddy_env: string) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.treddy_env = treddy_env;
    this.base_uri =
      TreddyEnv.treddy_env === "production"
        ? TreddyEnv.production_uri
        : TreddyEnv.sandbox_uri;

    this.base_uri = "http://localhost:8889";
  }
}

export class TreddyApiClient {
  config: TreddyApiClientConfiguration;

  constructor(config: TreddyApiClientConfiguration) {
    this.config = config;
  }

  oauth2(): OAuth2Client {
    return {
      getAccessToken: async () => {
        const { client_id, client_secret } = this.config;

        const basicAuth = `Basic ${base64.encode(
          `${client_id}:${client_secret}`
        )}`;

        return await fetch(`${this.config.base_uri}/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "*/*",
            Authorization: basicAuth,
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
          }),
        })
          .then((res) => res.json() as Promise<AccessToken>)
          .catch((err) => {
            console.log(err);
            return null;
          });
      },
    };
  }

  deals() {
    return {
      v1: () => {
        return {
          list: async (accessToken: string) => {
            return await fetch(`${this.config.base_uri}/deals/v1/deals`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }).then((res) => res.json() as Promise<Deal[]>);
          },

          get: async (accessToken: string, id: string) => {
            return await fetch(`${this.config.base_uri}/deals/v1/${id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            })
              .then((res) => res.json() as Promise<Deal>)
              .catch((err) => {
                console.log(err);
                return null;
              });
          },

          create: async (
            accessToken: string,
            payload: CreateDealPayload
          ): Promise<Deal | null> => {
            return await fetch(`${this.config.base_uri}/deals/v1/deals`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(payload),
            }).then(async (res) => {
              console.log(res.status);
              if (res.status !== 201) {
                return Promise.reject((await res.json()) as ApiError);
              }

              return res.json() as Promise<Deal>;
            });
          },

          setShippingType: async (
            accessToken: string,
            id: string,
            payload: SetShippingTypePayload
          ): Promise<SetShippingTypeResponse | null> => {
            return await fetch(
              `${this.config.base_uri}/deals/v1/deals/${id}/shipping`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
              }
            )
              .then((res) => {
                return res.json() as Promise<SetShippingTypeResponse>;
              })
              .catch((err) => {
                console.log(err);
                return null;
              });
          },

          offer: async (
            accessToken: string,
            id: string,
            payload: DealOfferPayload
          ): Promise<DealOfferResponse | ApiError | null> => {
            return await fetch(
              `${this.config.base_uri}/deals/v1/deals/${id}/offer`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
              }
            ).then(async (res) => {
              if (res.status !== 201) {
                return Promise.reject((await res.json()) as ApiError);
              }

              return res.json() as Promise<DealOfferResponse>;
            });
          },
        };
      },
    };
  }
}
