import { useState } from "react";
import { useFinances } from "../hooks/useFinances";
import { toast } from "@/hooks/use-toast";
import { Pencil, X, Check, Landmark, TrendingUp, Receipt, ShoppingCart, CreditCard, PiggyBank } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TrasactionsSection() {
  const { finances } = useFinances();

  return (
    <section>
      <h2>Crie sua transição financeira para geras desafios personalizados</h2>
      <p>Tente completar desafios para melhorar sua saúde financeira.</p>
    </section>
  );
}