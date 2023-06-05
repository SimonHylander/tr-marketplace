import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import { ScrollArea } from "~/components/ui/scroll-area";

import { api } from "~/utils/api";

type ProfileDialogProps = {
  trigger: React.FC;
  user: {
    id: string;
    name: string;
  };
};

const ProfileDialog = ({ trigger, user }: ProfileDialogProps) => {
  const { data: ads } = api.ad.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <Dialog>
      {trigger({})}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>{user.name}s profil</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm">Annonser</h3>

          <ScrollArea className="flex h-[400px] flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-md bg-white">
              {ads &&
                ads.map((ad, i) => (
                  <Link
                    href={`/ads/${ad.id}`}
                    key={i}
                    className="flex flex-col rounded border bg-white p-2"
                  >
                    <div className="relative bg-white">
                      <Image
                        src="/no-img.svg"
                        alt=""
                        className="rounded-tl rounded-tr"
                        width={150}
                        height={150}
                      />
                    </div>

                    <div className="flex flex-col gap-2 bg-white p-2">
                      <h3 className="text-[1.25rem] font-bold">{ad.name}</h3>

                      <div className="text-md flex flex-col">
                        <div className="text-sm">{ad.price}:-</div>
                        <div className="text-sm">Stockholm</div>
                      </div>

                      {ad?.treddy?.dealId && (
                        <div className="flex items-center gap-2 text-xs">
                          <Image src="/tr.svg" alt="" width={16} height={16} />
                          Frakt och trygg betalning
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
