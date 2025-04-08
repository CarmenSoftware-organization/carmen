"use client"

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom-dialog";

interface DialogPageTemplateProps {
  title: ReactNode;
  content: ReactNode;
  footerButtons?: ReactNode;
  titleButtons?: ReactNode;
  height?: string;
  width?: string;
  isOpen: boolean;
  onClose: () => void;
}

const DialogPageTemplate: React.FC<DialogPageTemplateProps> = ({
  title,
  content,
  footerButtons,
  titleButtons,
  height,
  width,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[80vw] max-w-[80vw] py-6 px-10 border-none bg-white flex flex-col justify-between ${
          height ? height : ""
        } ${width ? width : ""}`}
      >
        <DialogHeader>
          <DialogTitle className="w-full flex justify-between">
            <div>
              {" "}
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <div className="w-fit flex flex-col gap-2">
              {/* <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 z-10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button> */}

              <div>{titleButtons}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="">{content}</div>

        {footerButtons && <DialogFooter>{footerButtons}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

export default DialogPageTemplate;
