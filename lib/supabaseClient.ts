import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xgwfenebcddeecvhwgyd.supabase.co';
const supabaseAnonKey = 'sb_publishable__akztRYwGJCb9VJ6c4szqg_-On8Xprm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);