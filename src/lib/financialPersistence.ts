import supabase from "../../utils/supabase";

export interface FinancialFormData {
  divida: number[];
  rendaFixa: number[];
  rendaVariavel: number[];
  gastosFixos: number[];
  gastosVariaveis: number[];
  investimentos: number[];
}

const sumValues = (values: number[]) => values.reduce((total, value) => total + value, 0);

export async function persistFinancialData(userId: string, finalData: FinancialFormData) {
  const financialPayload = {
    user_id: userId,
    fixedIncome: sumValues(finalData.rendaFixa),
    variableIncome: sumValues(finalData.rendaVariavel),
    fixedExpenses: sumValues(finalData.gastosFixos),
    variableExpenses: sumValues(finalData.gastosVariaveis),
    investments: sumValues(finalData.investimentos),
  };

  const financesPayload = {
    user_id: userId,
    fixed_income: sumValues(finalData.rendaFixa),
    variable_income: sumValues(finalData.rendaVariavel),
    fixed_expense: sumValues(finalData.gastosFixos),
    variable_expense: sumValues(finalData.gastosVariaveis),
    debts: sumValues(finalData.divida),
    investments: sumValues(finalData.investimentos),
  };

  const { data: existingFinancialRows, error: existingFinancialError } = await supabase
    .from("financial")
    .select("id")
    .eq("user_id", userId);

  if (existingFinancialError) {
    throw existingFinancialError;
  }

  const financialRequest = existingFinancialRows && existingFinancialRows.length > 0
    ? supabase.from("financial").update(financialPayload).eq("user_id", userId)
    : supabase.from("financial").insert([financialPayload]);

  const [financialResult, financesResult] = await Promise.all([
    financialRequest,
    supabase.from("finances").upsert(financesPayload, { onConflict: "user_id" }),
  ]);

  if (financialResult.error) {
    throw financialResult.error;
  }

  if (financesResult.error) {
    throw financesResult.error;
  }
}