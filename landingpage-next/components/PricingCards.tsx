"use client";

import { CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PACKAGES, type PackageConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/lib/checkout-context";

type PricingCardsProps = {
  packages?: PackageConfig[];
  title?: string;
  subtitle?: string;
  id?: string;
};

export function PricingCards({
  packages = PACKAGES,
  title = "Pakete",
  subtitle = "Einmalig prüfen oder dauerhaft absichern.",
  id = "preise",
}: PricingCardsProps) {
  const { openCheckout } = useCheckout();

  return (
    <section id={id} className="w-full bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={cn(
                "relative flex h-full flex-col",
                pkg.featured &&
                  "ring-2 ring-primary shadow-lg md:scale-[1.02]",
              )}
            >
              {pkg.featured && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  variant="default"
                >
                  Empfehlung
                </Badge>
              )}
              <CardHeader>
                <CardDescription className="font-semibold tracking-wide text-primary uppercase">
                  {pkg.tag}
                </CardDescription>
                <CardTitle className="mt-1 text-2xl">
                  <span className="text-3xl font-bold">{pkg.price}</span>
                  {pkg.priceSuffix && (
                    <span className="ml-1 text-base font-medium text-muted-foreground">
                      {pkg.priceSuffix}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="grid gap-2 text-sm">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckIcon
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="bg-transparent">
                <Button
                  className="w-full"
                  size="lg"
                  variant={pkg.featured ? "default" : "outline"}
                  onClick={() => openCheckout(pkg.id)}
                >
                  Auswählen
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
