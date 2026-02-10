import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Authenticate the caller and verify admin role
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authClient = createClient(supabaseUrl, anonKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role client for data operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentMonth = new Date().getMonth() + 1 // 1-12
    const isJuly = currentMonth === 7
    const isJanuary = currentMonth === 1

    console.log(`Semester progression triggered. Current month: ${currentMonth}, isJuly: ${isJuly}, isJanuary: ${isJanuary}`)

    // Only run in January or July (or force run for testing)
    const url = new URL(req.url)
    const forceRun = url.searchParams.get('force') === 'true'
    
    if (!isJuly && !isJanuary && !forceRun) {
      console.log('Not January or July, skipping semester progression')
      return new Response(
        JSON.stringify({ message: 'Semester progression only runs in January and July' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let results = {
      semesterUpdates: 0,
      convertedToAlumni: 0,
      errors: [] as string[]
    }

    // Get all approved student/scholar profiles with current_semester
    const { data: students, error: fetchError } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, current_semester, expected_passout_year, college_id, branch_id, high_commission_id, scholarship_year')
      .in('user_type', ['student', 'scholar'])
      .eq('status', 'approved')
      .not('current_semester', 'is', null)

    if (fetchError) {
      console.error('Error fetching students:', fetchError)
      throw fetchError
    }

    console.log(`Found ${students?.length || 0} students with semester data`)

    if (!students || students.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No students found to update', results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentYear = new Date().getFullYear()

    for (const student of students) {
      const currentSem = student.current_semester

      // In July: Progress from even semesters (2,4,6) to odd (3,5,7), and 8th sem → alumni
      // In January: Progress from odd semesters (1,3,5,7) to even (2,4,6,8)
      
      if (isJuly || forceRun) {
        if (currentSem === 8) {
          // Convert to alumni
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              user_type: 'alumni',
              current_semester: null,
              passout_year: currentYear,
              expected_passout_year: null
            })
            .eq('id', student.id)

          if (updateError) {
            console.error(`Error converting student ${student.id} to alumni:`, updateError)
            results.errors.push(`Failed to convert ${student.full_name}: ${updateError.message}`)
          } else {
            console.log(`Converted ${student.full_name} to alumni (was 8th sem)`)
            results.convertedToAlumni++
          }
        } else if (currentSem % 2 === 0 && currentSem < 8) {
          // Even semester in July → increment to odd
          const newSem = currentSem + 1
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ current_semester: newSem })
            .eq('id', student.id)

          if (updateError) {
            console.error(`Error updating semester for ${student.id}:`, updateError)
            results.errors.push(`Failed to update ${student.full_name}: ${updateError.message}`)
          } else {
            console.log(`Updated ${student.full_name}: ${currentSem} → ${newSem}`)
            results.semesterUpdates++
          }
        }
      }

      if (isJanuary) {
        if (currentSem % 2 === 1 && currentSem < 8) {
          // Odd semester in January → increment to even
          const newSem = currentSem + 1
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ current_semester: newSem })
            .eq('id', student.id)

          if (updateError) {
            console.error(`Error updating semester for ${student.id}:`, updateError)
            results.errors.push(`Failed to update ${student.full_name}: ${updateError.message}`)
          } else {
            console.log(`Updated ${student.full_name}: ${currentSem} → ${newSem}`)
            results.semesterUpdates++
          }
        }
      }
    }

    console.log('Semester progression completed:', results)

    return new Response(
      JSON.stringify({ 
        message: 'Semester progression completed',
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in semester progression:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
