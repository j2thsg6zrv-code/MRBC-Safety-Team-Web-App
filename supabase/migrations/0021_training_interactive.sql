-- Interactive classes (Matt, 2026-10-29): lessons are shown as slides that
-- are read aloud, and each can carry a practice question with instant
-- feedback. Adds the practice question fields, plus videos and a practice
-- question for each lesson of the ten starter classes.

alter table public.training_lessons
  add column check_prompt text,
  add column check_choices text[] check (check_choices is null or cardinality(check_choices) between 2 and 6),
  add column check_answer integer check (check_answer is null or check_answer >= 0),
  add column check_explanation text;

-- Class 1
update public.training_lessons set check_prompt = $t$It's 10:40 on Sunday and you notice a side door propped open with a rock. What's the team mindset here?$t$, check_choices = array[$t$Not my post, so I'll leave it$t$, $t$Notice it, report it, and close it or ask the team lead what to do$t$, $t$Wait to see if anyone suspicious comes in$t$], check_answer = 1, check_explanation = $t$Most of our work is noticing and communicating. A propped door is exactly the kind of small thing the team exists to catch.$t$, video_url = 'https://www.youtube.com/watch?v=Ku2peixQrjE'
 where class_id = '8c2eb09f-f0fd-42cb-a381-c75f6042947e' and position = 1;
update public.training_lessons set check_prompt = $t$A car pulls into the lot and the driver sits watching the main entrance. Which layer of security is this?$t$, check_choices = array[$t$Outer$t$, $t$Middle$t$, $t$Inner$t$], check_answer = 0, check_explanation = $t$The parking lot and drives are the outer layer, the first place we can notice something and buy time.$t$
 where class_id = '8c2eb09f-f0fd-42cb-a381-c75f6042947e' and position = 2;
update public.training_lessons set check_prompt = $t$Where should you be before the service starts?$t$, check_choices = array[$t$Wherever is comfortable$t$, $t$At your assigned post, knowing your relief and who you report to$t$, $t$In the sanctuary with your family$t$], check_answer = 1, check_explanation = $t$Knowing your post, your relief and your team lead before every service is what lets the team respond quickly.$t$
 where class_id = '8c2eb09f-f0fd-42cb-a381-c75f6042947e' and position = 3;
update public.training_lessons set check_prompt = $t$An usher asks what happened during last week's medical call. What do you say?$t$, check_choices = array[$t$Tell them everything, since they're a church member$t$, $t$Keep it to "it was handled" and let leadership share anything more$t$, $t$Post an update in the church group chat$t$], check_answer = 1, check_explanation = $t$Discretion protects the people involved and the church. Incident details stay within the team.$t$
 where class_id = '8c2eb09f-f0fd-42cb-a381-c75f6042947e' and position = 4;

-- Class 2
update public.training_lessons set check_prompt = $t$Which of these is the best example of an anomaly worth a second look?$t$, check_choices = array[$t$A family arriving late with three kids$t$, $t$A man in a heavy coat on a 95-degree day who keeps walking the hallway$t$, $t$Someone sitting in the back row$t$], check_answer = 1, check_explanation = $t$Lots of things are unusual but harmless. Clothing that doesn't fit the weather plus repeated wandering is a pattern worth watching.$t$
 where class_id = '76677062-f884-4ee6-be6b-08c76b85bd75' and position = 1;
update public.training_lessons set check_prompt = $t$You notice someone staring at the children's wing doors. What level of alertness do you move to?$t$, check_choices = array[$t$Stay relaxed. It's probably nothing$t$, $t$Focused (orange), and tell your team$t$, $t$Action (red), and confront them now$t$], check_answer = 1, check_explanation = $t$Moving to focused early and telling the team buys time without overreacting.$t$
 where class_id = '76677062-f884-4ee6-be6b-08c76b85bd75' and position = 2;
update public.training_lessons set check_prompt = $t$Which detail matters most to watch?$t$, check_choices = array[$t$Their shoes$t$, $t$Their phone$t$, $t$Their hands$t$], check_answer = 2, check_explanation = $t$Hands are what can hold a weapon or cause harm. Watch them first.$t$
 where class_id = '76677062-f884-4ee6-be6b-08c76b85bd75' and position = 3;
update public.training_lessons set check_prompt = $t$Which report helps the team the most?$t$, check_choices = array[$t$"Some guy looks sketchy."$t$, $t$"Man, blue jacket, east hallway, tried the nursery door twice, heading to the lobby."$t$, $t$"I've got a bad feeling."$t$], check_answer = 1, check_explanation = $t$A good report gives description, location, behavior and direction, so teammates know exactly who and where.$t$
 where class_id = '76677062-f884-4ee6-be6b-08c76b85bd75' and position = 4;

-- Class 3
update public.training_lessons set check_prompt = $t$A visitor is shouting at a greeter about a parking spot. Before you step in, what's the first thing to ask yourself?$t$, check_choices = array[$t$Is anyone in immediate danger?$t$, $t$Who is right about the parking spot?$t$, $t$Should I ask them to leave?$t$], check_answer = 0, check_explanation = $t$Assess first. If someone is in immediate danger, it's an emergency, so call 911. If not, de-escalate.$t$, video_url = 'https://www.youtube.com/watch?v=UBNsWC_b5Yo'
 where class_id = '717958c1-24fc-4f3d-9fde-e56c60517b83' and position = 1;
update public.training_lessons set check_prompt = $t$Where do you stand when you approach them?$t$, check_choices = array[$t$Right in front of them, close enough to block them$t$, $t$At an angle, about two arm's lengths away, hands open and visible$t$, $t$Behind them so they can't see you coming$t$], check_answer = 1, check_explanation = $t$Standing at an angle with open hands feels less threatening and keeps you safe.$t$
 where class_id = '717958c1-24fc-4f3d-9fde-e56c60517b83' and position = 2;
update public.training_lessons set check_prompt = $t$Which response is most likely to calm them down?$t$, check_choices = array[$t$"Calm down, sir."$t$, $t$"You need to leave now."$t$, $t$"I can see you're frustrated. Let's step out to the lobby and sort this out."$t$], check_answer = 2, check_explanation = $t$Acknowledge the feeling and offer a choice. "Calm down" usually makes things worse.$t$
 where class_id = '717958c1-24fc-4f3d-9fde-e56c60517b83' and position = 3;
update public.training_lessons set check_prompt = $t$The person gets closer and reaches into their jacket while yelling threats. What now?$t$, check_choices = array[$t$Keep talking in a calm voice$t$, $t$Step back, create distance, radio the team lead, and call 911$t$, $t$Grab their arm$t$], check_answer = 1, check_explanation = $t$Threats, closing distance and reaching for something mean talking isn't working. Get distance and get help.$t$
 where class_id = '717958c1-24fc-4f3d-9fde-e56c60517b83' and position = 4;

-- Class 4
update public.training_lessons set check_prompt = $t$During the sermon you hear gunshots from the lobby. The side exit near you is clear. What do you do?$t$, check_choices = array[$t$Get people out the side exit, away from the threat$t$, $t$Tell everyone to hide under the pews$t$, $t$Go to the lobby to see what's happening$t$], check_answer = 0, check_explanation = $t$If there's a safe way out, run is the first option. Get away from the threat.$t$, video_url = 'https://www.youtube.com/watch?v=8rDdY4EaKVY'
 where class_id = '7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51' and position = 1;
update public.training_lessons set check_prompt = $t$What's your job as a team member in the first minute?$t$, check_choices = array[$t$Find the attacker yourself$t$, $t$Alert people with the agreed code, direct them to safe exits, and call 911$t$, $t$Wait for the team lead's instructions$t$], check_answer = 1, check_explanation = $t$Sound the alarm, move people away from the threat, and get police on the way.$t$
 where class_id = '7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51' and position = 2;
update public.training_lessons set check_prompt = $t$Police rush in while you're holding a radio and phone. What do you do?$t$, check_choices = array[$t$Run to them and point toward the attacker$t$, $t$Drop what you're holding, keep your hands visible, and follow their commands$t$, $t$Ask them to help the wounded first$t$], check_answer = 1, check_explanation = $t$Officers don't know who the attacker is. Empty, visible hands keep you safe.$t$
 where class_id = '7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51' and position = 3;
update public.training_lessons set check_prompt = $t$After police clear the building, how do you account for children?$t$, check_choices = array[$t$Let parents search the classrooms$t$, $t$Use the check-in records at the reunification point$t$, $t$Wait for children to find their parents$t$], check_answer = 1, check_explanation = $t$Check-in records let you account for every child and release them only to the right adult.$t$
 where class_id = '7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51' and position = 4;

-- Class 5
update public.training_lessons set check_prompt = $t$An older man collapses in the foyer. What's your first move?$t$, check_choices = array[$t$Make sure the scene is safe, then check if he responds$t$, $t$Start CPR right away$t$, $t$Run to find a doctor in the congregation$t$], check_answer = 0, check_explanation = $t$Scene safety first, then check responsiveness. Then send specific people for 911 and the AED.$t$
 where class_id = '8dddf7b8-2097-41bb-af1e-b772ef2ad788' and position = 1;
update public.training_lessons set check_prompt = $t$He isn't breathing normally. Who calls 911?$t$, check_choices = array[$t$Whoever feels like it$t$, $t$A specific person you point to: "You, in the blue shirt, call 911"$t$, $t$You, after you finish CPR$t$], check_answer = 1, check_explanation = $t$Pointing to a specific person makes sure the call actually gets made.$t$, video_url = 'https://www.youtube.com/watch?v=zSgmledxFe8'
 where class_id = '8dddf7b8-2097-41bb-af1e-b772ef2ad788' and position = 2;
update public.training_lessons set check_prompt = $t$Blood is soaking through the cloth you're pressing on a leg wound. What do you do?$t$, check_choices = array[$t$Remove the cloth to look at the wound$t$, $t$Leave it, add more on top, and keep pressing hard$t$, $t$Stop pressing and wait for EMS$t$], check_answer = 1, check_explanation = $t$Removing soaked gauze pulls away the clot that's forming. Add more and keep pressure on.$t$, video_url = 'https://www.youtube.com/watch?v=7LEqWoK_aS0'
 where class_id = '8dddf7b8-2097-41bb-af1e-b772ef2ad788' and position = 3;
update public.training_lessons set check_prompt = $t$Someone's face is drooping and their speech is slurred. What do you suspect?$t$, check_choices = array[$t$Low blood sugar$t$, $t$A stroke, so call 911 right away$t$, $t$They're just tired$t$], check_answer = 1, check_explanation = $t$Face drooping and slurred speech are BE FAST warning signs. Every minute counts.$t$
 where class_id = '8dddf7b8-2097-41bb-af1e-b772ef2ad788' and position = 4;

-- Class 6
update public.training_lessons set check_prompt = $t$Your church runs background checks on every volunteer. Is that enough?$t$, check_choices = array[$t$Yes, a clean check means they're safe$t$, $t$No. Training, screening, policies and oversight all work together$t$, $t$Only for paid staff$t$], check_answer = 1, check_explanation = $t$Most abusers have no criminal record. A background check is one part of a safety system, not the whole thing.$t$
 where class_id = '0cb51b9d-fe93-4cc1-8a80-824222262674' and position = 1;
update public.training_lessons set check_prompt = $t$A woman you don't recognize asks to pick up a child but doesn't have the matching tag. What happens?$t$, check_choices = array[$t$Release the child if the child seems to know her$t$, $t$Don't release the child. Call the team lead and the parent who checked them in$t$, $t$Ask her to describe the child$t$], check_answer = 1, check_explanation = $t$No matching tag means no release, no exceptions. The parent and team lead sort it out.$t$
 where class_id = '0cb51b9d-fe93-4cc1-8a80-824222262674' and position = 2;
update public.training_lessons set check_prompt = $t$You see a volunteer alone with one child in a closed classroom. What should you do?$t$, check_choices = array[$t$Nothing, they're a trusted volunteer$t$, $t$Open the door, rejoin the group, and report it to the children's ministry leader$t$, $t$Mention it next month$t$], check_answer = 1, check_explanation = $t$One adult alone with one child out of sight breaks the policy that protects both the child and the volunteer.$t$
 where class_id = '0cb51b9d-fe93-4cc1-8a80-824222262674' and position = 3;
update public.training_lessons set check_prompt = $t$A child tells you something that sounds like abuse. What do you say?$t$, check_choices = array[$t$"I promise I won't tell anyone."$t$, $t$"Thank you for telling me. You did the right thing." Then report it right away$t$, $t$"Are you sure? That's a serious thing to say."$t$], check_answer = 1, check_explanation = $t$Stay calm, believe them, don't promise secrecy, and report through MRBC's process and state law.$t$
 where class_id = '0cb51b9d-fe93-4cc1-8a80-824222262674' and position = 4;

-- Class 7
update public.training_lessons set check_prompt = $t$You smell smoke and find a small trash can fire in the kitchen. What comes first?$t$, check_choices = array[$t$Get anyone nearby away from it$t$, $t$Grab the extinguisher$t$, $t$Take a photo for the report$t$], check_answer = 0, check_explanation = $t$RACE starts with Rescue. People come first, then the alarm.$t$
 where class_id = '531507c8-e55d-467a-86b2-1589c54c4a0c' and position = 1;
update public.training_lessons set check_prompt = $t$You're using an extinguisher. Where do you aim?$t$, check_choices = array[$t$At the top of the flames$t$, $t$At the base of the fire, sweeping side to side$t$, $t$At the smoke$t$], check_answer = 1, check_explanation = $t$Aim at the base where the fuel is. Spraying the flames does very little.$t$, video_url = 'https://www.youtube.com/watch?v=PQV71INDaqY'
 where class_id = '531507c8-e55d-467a-86b2-1589c54c4a0c' and position = 2;
update public.training_lessons set check_prompt = $t$The alarm sounds during worship but nobody sees fire. What do you do?$t$, check_choices = array[$t$Wait for the pastor to decide$t$, $t$Start evacuating your section right away$t$, $t$Go look for the cause$t$], check_answer = 1, check_explanation = $t$Treat every alarm as real. Evacuate first and let the fire department decide.$t$
 where class_id = '531507c8-e55d-467a-86b2-1589c54c4a0c' and position = 3;
update public.training_lessons set check_prompt = $t$Everyone is outside at the meeting point. A teacher says one child is missing. What happens?$t$, check_choices = array[$t$The teacher goes back inside to look$t$, $t$The team lead tells the fire department right away$t$, $t$Wait a few minutes for the child to show up$t$], check_answer = 1, check_explanation = $t$Never go back in. Firefighters need to know right away who's missing and where they were last seen.$t$
 where class_id = '531507c8-e55d-467a-86b2-1589c54c4a0c' and position = 4;

-- Class 8
update public.training_lessons set check_prompt = $t$The weather radio says a tornado watch is in effect during the service. What does that mean?$t$, check_choices = array[$t$A tornado is coming right now$t$, $t$Conditions make tornadoes possible, so stay alert and monitor$t$, $t$The storm is over$t$], check_answer = 1, check_explanation = $t$A watch means be ready. A warning means take shelter now.$t$, video_url = 'https://www.youtube.com/watch?v=x3V3HZBs1Y4'
 where class_id = '678301e7-1917-4814-b449-ac250c93bab9' and position = 1;
update public.training_lessons set check_prompt = $t$A tornado warning is issued. Where do you send people from the sanctuary?$t$, check_choices = array[$t$Stay in the pews and duck$t$, $t$Out to their cars$t$, $t$Interior rooms and hallways on the lowest floor, away from windows$t$], check_answer = 2, check_explanation = $t$Large rooms with wide roofs are dangerous in high winds. Interior spaces on the lowest floor are safest.$t$, video_url = 'https://www.youtube.com/watch?v=_5TiTfuvotc'
 where class_id = '678301e7-1917-4814-b449-ac250c93bab9' and position = 2;
update public.training_lessons set check_prompt = $t$Everyone heads for the same hallway at once. How could you have prevented the jam?$t$, check_choices = array[$t$Assign each section its own route ahead of time$t$, $t$Let people go wherever they want$t$, $t$Use only the main doors$t$], check_answer = 0, check_explanation = $t$Planned routes for each section keep hallways moving when seconds count.$t$
 where class_id = '678301e7-1917-4814-b449-ac250c93bab9' and position = 3;
update public.training_lessons set check_prompt = $t$The warning has expired. Before people go back to the sanctuary, what do you check?$t$, check_choices = array[$t$Whether the coffee is still hot$t$, $t$Injuries, gas smells, downed lines and building damage$t$, $t$Nothing, the storm is over$t$], check_answer = 1, check_explanation = $t$Hazards after a storm can hurt people who leave shelter too quickly.$t$
 where class_id = '678301e7-1917-4814-b449-ac250c93bab9' and position = 4;

-- Class 9
update public.training_lessons set check_prompt = $t$Someone else is mid-sentence on the radio. What do you do?$t$, check_choices = array[$t$Talk over them, since yours is important$t$, $t$Wait until they finish, then press, pause and speak$t$, $t$Switch channels$t$], check_answer = 1, check_explanation = $t$Listen before you talk. Two people transmitting at once means nobody gets heard.$t$
 where class_id = 'ef82d3b2-43b7-483d-a05c-cc148b067912' and position = 1;
update public.training_lessons set check_prompt = $t$Which radio call is best when someone faints?$t$, check_choices = array[$t$"Mrs. Jones just passed out, I think it's her heart!"$t$, $t$"Team Lead, Lobby. Need a medic at the east doors."$t$, $t$"Help! Emergency!"$t$], check_answer = 1, check_explanation = $t$Who you're calling, who you are, and what you need, with no names or diagnoses others might overhear.$t$
 where class_id = 'ef82d3b2-43b7-483d-a05c-cc148b067912' and position = 2;
update public.training_lessons set check_prompt = $t$A visitor tripped on the steps but says they're fine. Do you file a report?$t$, check_choices = array[$t$No, nobody got hurt$t$, $t$Yes, file it in the app the same day$t$, $t$Only if they ask you to$t$], check_answer = 1, check_explanation = $t$Small incidents still matter. Reports show patterns and protect everyone if questions come up later.$t$
 where class_id = 'ef82d3b2-43b7-483d-a05c-cc148b067912' and position = 3;
update public.training_lessons set check_prompt = $t$Which sentence belongs in an incident report?$t$, check_choices = array[$t$"He was obviously drunk."$t$, $t$"He said, 'You can't make me leave,' and walked toward the stage."$t$, $t$"She seemed like a troublemaker."$t$], check_answer = 1, check_explanation = $t$Stick to what you saw and heard. Quote people and leave out guesses about motives or conditions.$t$
 where class_id = 'ef82d3b2-43b7-483d-a05c-cc148b067912' and position = 4;

-- Class 10
update public.training_lessons set check_prompt = $t$A greeter notices a visitor who seems very nervous and avoids eye contact. What should the greeter do?$t$, check_choices = array[$t$Ask them to leave$t$, $t$Welcome them warmly and quietly let the safety team know$t$, $t$Follow them around the building$t$], check_answer = 1, check_explanation = $t$Greeters report and the safety team responds. A warm welcome often eases nerves too.$t$
 where class_id = '89fb1e88-4837-4912-a653-6912f996ee61' and position = 1;
update public.training_lessons set check_prompt = $t$It's warm in the building. Is it OK to prop a side door open?$t$, check_choices = array[$t$Yes, if it's just for a few minutes$t$, $t$No. Keep doors closed and watched, and fix the airflow another way$t$, $t$Only during the sermon$t$], check_answer = 1, check_explanation = $t$A propped door bypasses the layer of security the team is watching.$t$
 where class_id = '89fb1e88-4837-4912-a653-6912f996ee61' and position = 2;
update public.training_lessons set check_prompt = $t$You see someone walking the lot trying car door handles. What do you do?$t$, check_choices = array[$t$Confront them right away$t$, $t$Note their description and direction and report it to the team lead$t$, $t$Ignore it, since it's not inside the building$t$], check_answer = 1, check_explanation = $t$Watch, note details, and report. Let the team lead decide the response.$t$
 where class_id = '89fb1e88-4837-4912-a653-6912f996ee61' and position = 3;
update public.training_lessons set check_prompt = $t$The usher who counts the offering asks you to carry the bag to the office alone. What do you say?$t$, check_choices = array[$t$Sure, it's quicker$t$, $t$Two unrelated people should handle it, so let's walk it together$t$, $t$Leave it on the table for later$t$], check_answer = 1, check_explanation = $t$Two-person handling protects the money and the people handling it.$t$
 where class_id = '89fb1e88-4837-4912-a653-6912f996ee61' and position = 4;

-- The Run. Hide. Fight. video dramatizes a shooting, so say so on its slide.
update public.training_lessons set body = body || E'\nThe video below is a dramatization of an active shooter event and may be upsetting.'
 where class_id = '7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51' and position = 1;

-- Each member's place in a class, saved as they go (Matt, 2026-10-29), so
-- closing the app or stepping away picks up where they left off.
create table public.training_progress (
  profile_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  class_id uuid not null references public.training_classes (id) on delete cascade,
  -- Highest slide whose reading has finished (-1 = none); 0 is the first slide.
  done_through integer not null default -1,
  -- The slide they were on; the slide count means the quiz.
  current_slide integer not null default 0,
  -- Quiz choices so far, question index → choice index.
  quiz_answers jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (profile_id, class_id)
);

alter table public.training_progress enable row level security;
create policy "Members see their own progress" on public.training_progress
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());
create policy "Members save their own progress" on public.training_progress
  for insert to authenticated with check (profile_id = auth.uid() and public.can_see_class(class_id));
create policy "Members update their own progress" on public.training_progress
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Realistic times now that the slides are read aloud: reading (~160 words a
-- minute), about 45 seconds per practice question, about 2.5 minutes for the
-- quiz, plus the videos.
update public.training_classes c set minutes = t.minutes
  from (values
    ('8c2eb09f-f0fd-42cb-a381-c75f6042947e'::uuid, 11), ('76677062-f884-4ee6-be6b-08c76b85bd75'::uuid, 7),
    ('717958c1-24fc-4f3d-9fde-e56c60517b83'::uuid, 21), ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51'::uuid, 13),
    ('8dddf7b8-2097-41bb-af1e-b772ef2ad788'::uuid, 13), ('0cb51b9d-fe93-4cc1-8a80-824222262674'::uuid, 7),
    ('531507c8-e55d-467a-86b2-1589c54c4a0c'::uuid, 9), ('678301e7-1917-4814-b449-ac250c93bab9'::uuid, 9),
    ('ef82d3b2-43b7-483d-a05c-cc148b067912'::uuid, 7), ('89fb1e88-4837-4912-a653-6912f996ee61'::uuid, 7)
  ) as t(id, minutes)
 where c.id = t.id;
