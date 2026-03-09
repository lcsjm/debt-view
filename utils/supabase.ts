import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wltiqhyvlggihpqhxard.supabase.co"
const supabaseKey = "sb_publishable_NDkrPxfZ4kwQLXGFBY6xWg_QS73QYcq"

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
        