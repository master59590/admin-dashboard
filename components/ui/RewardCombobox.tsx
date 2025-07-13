"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface RewardComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[]; // เช่น: ["all", "แถม!", "ของเล่น", ...]
}

export function RewardCombobox({
  value,
  onChange,
  options,
}: RewardComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[160px] justify-between"
        >
          {value
            ? value === "all"
              ? "All Rewards"
              : options.find((option) => option === value)
            : "เลือก Reward ทั้งหมด"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[160px] p-0">
        <Command>
          <CommandInput placeholder="พิมพ์ชื่อ reward..." className="h-9" />
          <CommandEmpty>ไม่พบ reward</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
