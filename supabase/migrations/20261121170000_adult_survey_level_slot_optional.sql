-- /enquete-adultes no longer asks "Niveau et créneau de cours".
-- Step 1 of 2: make the column optional so both the old and new site code can
-- insert while the deploy rolls out. Step 2 (next migration) drops the column.
alter table public.adult_survey_responses alter column level_slot drop not null;
