import { useZodForm } from "~/utils/form";
import { z } from "zod";

import { Controller } from "react-hook-form";
import { createAdSchema } from "~/schema/ad";

import { api } from "~/utils/api";
import Image from "next/image";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

const CreateForm = () => {
  const utils = api.useContext();

  const { mutate: createAd } = api.ad.create.useMutation({
    onSuccess: () => {
      utils.ad.list.invalidate();
    },
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useZodForm({
    schema: createAdSchema,
    defaultValues: {
      enableTreddy: false,
    },
  });

  const onSubmit = (data: z.infer<typeof createAdSchema>) => {
    createAd(data);
  };

  function radioValueToBoolean(value: string | null): boolean {
    if (value === "true") {
      return true;
    } else if (value === "false") {
      return false;
    }

    return false;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Namn</Label>
        <Input id="name" placeholder="Namn" {...register("name")} />
      </div>

      <div>
        <Label htmlFor="description">Beskriv din vara</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Beskrivning.."
          className="min-h-[10rem] rounded p-4"
        ></Textarea>
      </div>

      <div>
        <Label htmlFor="price" className="font-bold text-white">
          Pris
        </Label>

        <Input
          type="number"
          id="price"
          {...register("price", {
            valueAsNumber: true,
            pattern: {
              value: /^(0|[1-9]\d*)(\.\d+)?$/,
            },
          })}
          placeholder="Pris"
          className="rounded p-4"
        />
      </div>

      <div className="grid grid-cols-3 border-2 border-[#155d64] bg-white p-4">
        <div className="col-span-2">
          <p className="mb-2">
            <strong>
              Erbjud säker och enkel betalning och frakt med Treddy
            </strong>{" "}
            - helt gratis för Dig som säljare. Köparen betalar fraktkostnaden
            och en mindre avgift vid genomfört köp.
          </p>

          <p className="mb-2">
            Allt för en lyckad affär - frakt, trygg betalning och mycket mer!
          </p>

          <div className="flex flex-col">
            <Label className="mb-2">
              <Controller
                name="enableTreddy"
                render={(props) => (
                  <input
                    type="radio"
                    name="enableTreddy"
                    value="true"
                    onChange={(e) => {
                      setValue(
                        "enableTreddy",
                        radioValueToBoolean(e.target.value)
                      );
                    }}
                    {...props}
                  />
                )}
                control={control}
              />
              <strong className="ml-2">Ja tack</strong>, aktivera Treddy för min
              annons
            </Label>

            <Label>
              <Controller
                name="enableTreddy"
                render={(props) => (
                  <input
                    type="radio"
                    name="enableTreddy"
                    value="false"
                    onChange={(e) => {
                      setValue(
                        "enableTreddy",
                        radioValueToBoolean(e.target.value)
                      );
                    }}
                    {...props}
                  />
                )}
                control={control}
              />
              <strong className="ml-2">Nej tack</strong>, jag aktiverar Treddy i
              efterhand
            </Label>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <Image src="/logo.svg" alt="Treddy" width={200} height={200} />
          <a
            href="https://treddy.se"
            className="border-b border-gray-500 text-gray-500"
          >
            Läs mer om Treddy
          </a>
        </div>
      </div>ri

      <Button
        type="submit"
        className="bg-[#155d64] p-4 text-white hover:bg-teal-700"
      >
        Ladda upp annons
      </Button>
    </form>
  );
};

export default CreateForm;
