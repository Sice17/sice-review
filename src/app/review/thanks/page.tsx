import { Star } from "lucide-react";

export default function ReviewThanksPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Star className="size-10 fill-amber-400 text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold">Tack för ditt omdöme!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Din feedback betyder mycket och hjälper oss att bli bättre.
        </p>
      </div>
    </div>
  );
}
