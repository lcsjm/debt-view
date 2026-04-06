import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing auth...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'agent_test_4@example.com',
    password: 'password123'
  });
  
  // If login fails, we skip testing as user. We just wanna see if debts schema has amount
  let userId = authData?.user?.id;
  
  console.log("Testing debts schema by inserting a dummy debt...");
  const { data: debtData, error: debtErr } = await supabase
    .from('debts')
    .insert({ creditor: 'TEST SCRIPT', value: 1, amount: 1, rate: 0, status: 'Pendente' })
    .select()
    .single();
    
  console.log("Debt Insert Error:", debtErr);
  
  console.log("Testing finances upsert...");
  const { data: finData, error: finErr } = await supabase
    .from('finances')
    .upsert({ fixed_expense: 0 }, { onConflict: 'user_id' })
    .select()
    .single();
    
  console.log("Finance Upsert Error:", finErr);
}

test();
