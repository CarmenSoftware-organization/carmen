import React from 'react'
import { CreditNoteComponent } from "./credit-note";

interface CreditNoteDetailProps {
  backLink?: React.ReactElement | string
}

export function CreditNoteDetail({ backLink }: CreditNoteDetailProps) {
    return (
        <>
        <CreditNoteComponent />
        </>
    )
}