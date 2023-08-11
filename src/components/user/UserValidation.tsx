import { useEffect, useState } from "react";

import { api } from "~/utils/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export const UserValidation = () => {
  const [open, setOpen] = useState(false);

  const { data: userValidation } = api.user.validate.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (userValidation?.seller === false) {
      setOpen(true);
    }

    if (userValidation?.buyer === false) {
      setOpen(true);
    }
  }, [userValidation]);

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lägg till användare</DialogTitle>
          <DialogDescription>
            {!userValidation?.seller
              ? "Lägg till säljare"
              : !userValidation?.buyer
              ? "Lägg till köpare"
              : ""}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
