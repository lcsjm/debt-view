import supabase from './utils/supabase';
import { persistFinancialData, FinancialFormData } from './src/lib/financialPersistence';

const userId = "3b7d82ff-f82e-4870-b37b-5b5c1ae193c3";
const mockData: FinancialFormData = {
  divida: [123],
  rendaFixa: [1234],
  rendaVariavel: [0],
  gastosFixos: [500],
  gastosVariaveis: [250],
  investimentos: [100],
};

const accessToken = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjFhZWJiNDUyLTJjNzMtNDc2ZC04YjU2LWVmZDEwZTMxYzU2OSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3dsdGlxaHl2bGdnaWhwcWh4YXJkLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIzYjdkODJmZi1mODJlLTQ4NzAtYjM3Yi01YjVjMWFlMTkzYzMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc1NjkwNzQ5LCJpYXQiOjE3NzU2ODcxNDksImVtYWlsIjoidmZsYTIwMTRAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJjcGYiOiI0MTQuOTMyLjQ5Mi0zOSIsImVtYWlsIjoidmZsYTIwMTRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IlRlc3RlICIsImdlbmRlciI6Ik1hc2N1bGlubyIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicmFjZSI6IlBhcmRhIiwic3ViIjoiM2I3ZDgyZmYtZjgyZS00ODcwLWIzN2ItNWI1YzFhZTE5M2MzIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NzU2ODcxNDl9XSwic2Vzc2lvbl9pZCI6IjJhNDMxNzQ3LTliMTgtNGNjMC05NTg3LTc0MTcwOTliNTI1MiIsImlzX2Fub255bW91cyI6ZmFsc2V9.-ro8YGEx44WwtDePhjZcbJKOn4NC25LkdNnhYlQi7OUlfF-7Do3D-QFYzfkJtk8cQgdDh9UP7G5VpNPf5X687w";
const refreshToken = "rthipywgzqqq";

async function runTest() {
  console.log("Setting user session...");
  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    console.error("Failed to set session:", sessionError);
    return;
  }
  console.log("Session set successfully for user:", sessionData.user?.email);

  console.log("Starting test against real Supabase...");
  try {
    const { data: q1, error: err1 } = await supabase.from("financial").update({
      fixedIncome: 1234,
      variableIncome: 0,
      fixedExpenses: 500,
      variableExpenses: 250,
      investments: 100
    }).eq("user_id", userId).select();
    console.log("Direct update result on financial:", q1, err1);

    await persistFinancialData(userId, mockData);
    console.log("SUCCESS: Data successfully updated/inserted in both tables in Supabase!");
    
    // Check the results back
    const { data: fin, error: e1 } = await supabase.from("financial").select("*").eq("user_id", userId);
    console.log("financial table state for user:");
    console.dir(fin, { depth: null });
    if (e1) console.error("Error reading financial:", e1);

    const { data: fins, error: e2 } = await supabase.from("finances").select("*").eq("user_id", userId);
    console.log("finances table state for user:");
    console.dir(fins, { depth: null });
    if (e2) console.error("Error reading finances:", e2);

  } catch (error) {
    console.error("ERROR running real request:", error);
  }
}

runTest();
