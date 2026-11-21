-- /enquete-adultes no longer asks "Niveau et créneau de cours".
-- Step 2 of 2: drop the column. Apply only after the site code that stops
-- sending level_slot is live in production. The table was empty when this ran.
alter table public.adult_survey_responses drop column level_slot;
