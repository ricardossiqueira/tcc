import { Loader2 } from "lucide-react";


export default function Loading() {
  return (
    <section className="container mx-auto items-center justify-center flex h-full" >
      <Loader2 className="animate-spin" />
      <span className="ml-3">
        Loading...
      </span>
    </section>
  )
}