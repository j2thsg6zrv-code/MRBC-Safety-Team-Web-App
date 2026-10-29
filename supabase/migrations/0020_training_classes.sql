-- The first ten training classes (Matt, 2026-10-29), researched from CISA,
-- Ready.gov, the American Heart Association, Stop the Bleed, MinistrySafe and
-- other church safety sources. They start as drafts: members won't see them
-- until an admin reviews and approves each one on Training → Manage classes.
-- Each class earns its own qualification, valid for 24 months (change it on
-- the Qualifications page).

insert into public.qualifications (name, description, valid_months) values
  ($t$Safety Team Foundations$t$, $t$Earned by passing the Church Safety Team Foundations class.$t$, 24),
  ($t$Situational Awareness$t$, $t$Earned by passing the Situational Awareness and Threat Recognition class.$t$, 24),
  ($t$Verbal De-escalation$t$, $t$Earned by passing the Verbal De-escalation class.$t$, 24),
  ($t$Active Threat Response$t$, $t$Earned by passing the Active Threat Response class.$t$, 24),
  ($t$Medical Response Awareness$t$, $t$Earned by passing the Medical Emergencies, CPR/AED and Stop the Bleed class.$t$, 24),
  ($t$Child Protection$t$, $t$Earned by passing the Child Protection and Safe Check-in class.$t$, 24),
  ($t$Fire and Evacuation$t$, $t$Earned by passing the Fire Safety and Building Evacuation class.$t$, 24),
  ($t$Severe Weather Response$t$, $t$Earned by passing the Severe Weather and Shelter-in-Place class.$t$, 24),
  ($t$Communications and Reporting$t$, $t$Earned by passing the Radio Communication and Incident Reporting class.$t$, 24),
  ($t$Entry and Exterior Safety$t$, $t$Earned by passing the Greeters, Ushers, Entrances and Parking Lot class.$t$, 24)
on conflict (name) do nothing;

-- 1. Church Safety Team Foundations
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order) values
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', $t$Church Safety Team Foundations$t$, $t$Why the team exists, the layers of security, roles on the team, and how a team member conducts themselves. Recommended as every member's first class.$t$, 35,
   (select id from public.qualifications where name = $t$Safety Team Foundations$t$),
   null, 1);
insert into public.training_lessons (class_id, position, title, body) values
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 1, $t$Why we have a safety team$t$, $t$- Our job is to protect people so the church can worship, teach, and serve without fear.
- The team's core cycle is observe, report, and respond. Most of the work is noticing and communicating, not confronting.
- A good team builds a culture of caring, where members feel free to report concerns through the right channel.
- We serve the congregation. Be welcoming first and watchful always.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 2, $t$Layers of security$t$, $t$- CISA recommends protecting the outer, middle, and inner perimeters of a campus.
- **Outer:** parking lots, drives, and the property line. Watch arrivals and vehicles.
- **Middle:** building exteriors and entry doors. Control which doors are open and who is near them.
- **Inner:** the sanctuary, children's areas, offices, and the offering. Extra protection goes where the most vulnerable people are.
- Each layer gives the team more time to notice a problem and respond.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 3, $t$Roles on the team$t$, $t$- **Team lead:** runs the service plan, assigns posts, and makes the call on escalation.
- **Greeters and ushers:** the first friendly face and the first set of eyes.
- **Parking and exterior:** watches the outer layer and walks the grounds.
- **Children's area:** protects check-in, classrooms, and pickup.
- **Medical responders:** bring the first aid kit and AED and give care until EMS arrives.
- Know your post, your relief, and who you report to before every service.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 4, $t$How a team member conducts themselves$t$, $t$- Arrive early, check in, and confirm your radio works.
- Stay alert. Limit phone use and side conversations while on post.
- Be discreet. Don't discuss incidents or people outside the team.
- Call 911 early. It's better to cancel a call than to wait too long.
- Follow the chain of command and write down what you saw after any incident.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 1, $t$What is the safety team's core cycle?$t$, array[$t$Confront, remove, report$t$, $t$Observe, report, respond$t$, $t$Watch, wait, decide$t$, $t$Search, secure, dismiss$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 2, $t$Which area is part of the inner perimeter?$t$, array[$t$The parking lot$t$, $t$The front sidewalk$t$, $t$The children's classrooms$t$, $t$The property line$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 3, $t$Why does security work in layers?$t$, array[$t$It requires fewer volunteers$t$, $t$Each layer gives the team more time to notice and respond$t$, $t$It keeps visitors out of the building$t$, $t$Insurance requires exactly three layers$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 4, $t$When should you call 911?$t$, array[$t$Only after the team lead approves$t$, $t$Only after someone is hurt$t$, $t$Early, because a call can be canceled$t$, $t$Never during a service$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 5, $t$What should you do after any incident?$t$, array[$t$Post about it so the church is informed$t$, $t$Write down what you saw and report it through the chain of command$t$, $t$Wait to see if anyone else reports it$t$, $t$Nothing, if no one was hurt$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;

-- 2. Situational Awareness and Threat Recognition
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order) values
  ('76677062-f884-4ee6-be6b-08c76b85bd75', $t$Situational Awareness and Threat Recognition$t$, $t$Knowing what normal looks like, levels of alertness, warning signs worth a second look, and how to report what you see.$t$, 40,
   (select id from public.qualifications where name = $t$Situational Awareness$t$),
   '8c2eb09f-f0fd-42cb-a381-c75f6042947e', 2);
insert into public.training_lessons (class_id, position, title, body) values
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 1, $t$Know the baseline$t$, $t$- The baseline is what normal looks like on a Sunday at MRBC: who arrives when, where people park, how they move and dress.
- Threats usually show up as anomalies, things that don't fit the baseline.
- An anomaly is a reason to look closer, not proof of danger. Most have innocent explanations.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 2, $t$Levels of alertness$t$, $t$- **Relaxed (white):** unaware of surroundings. Never on post.
- **Alert (yellow):** calm, scanning, aware. This is where you should be all service.
- **Focused (orange):** a specific person or thing has your attention. Tell your team.
- **Action (red):** you are responding. The plan is in motion.
- Moving from yellow to orange early buys time. Moving to red without warning is what we train to avoid.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 3, $t$Warning signs worth a second look$t$, $t$- Clothing that doesn't fit the weather, such as a heavy coat on a hot day, that could hide something.
- Unusual interest in exits, cameras, staff, or the safety team.
- Testing locked doors or wandering into restricted areas like the children's wing or offices.
- Agitation, fixation on a person, or statements of grievance or threats, including on social media.
- Unattended bags or packages, or vehicles parked in odd places.
- Watch the hands. Hands are what can hurt someone.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 4, $t$Reporting what you see$t$, $t$- Report what you observe, not what you assume. "Man in gray hoodie, left balcony, has walked the hallway three times" beats "suspicious guy."
- Give location, description, behavior, and direction of travel.
- Use your radio or tell the team lead right away. Don't confront alone.
- If you see something, say something. A report that turns out to be nothing is still a good report.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 1, $t$What is a baseline?$t$, array[$t$The front row of the sanctuary$t$, $t$What normal looks like for our church$t$, $t$The minimum number of team members$t$, $t$A list of known troublemakers$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 2, $t$Which alertness level should you hold while on post?$t$, array[$t$Relaxed (white)$t$, $t$Alert (yellow)$t$, $t$Focused (orange)$t$, $t$Action (red)$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 3, $t$You notice someone repeatedly trying locked doors near the children's wing. What should you do?$t$, array[$t$Ignore it, since they are probably lost$t$, $t$Confront them alone and ask them to leave$t$, $t$Report location, description, and behavior to your team right away$t$, $t$Wait until after the service to mention it$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 4, $t$Which is the best report?$t$, array[$t$"There's a weird guy out there"$t$, $t$"Something feels off"$t$, $t$"Man, gray hoodie, east hallway, tried the nursery door twice, heading to the lobby"$t$, $t$"I don't like the look of him"$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 5, $t$Why do team members watch people's hands?$t$, array[$t$To check for wedding rings$t$, $t$Hands are what can hold a weapon or cause harm$t$, $t$To see who is giving in the offering$t$, $t$It is a polite way to avoid eye contact$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;

-- 3. Verbal De-escalation
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order) values
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', $t$Verbal De-escalation$t$, $t$Calming an upset or disruptive person with your body, voice, and words, and knowing when talking isn't working.$t$, 40,
   (select id from public.qualifications where name = $t$Verbal De-escalation$t$),
   '76677062-f884-4ee6-be6b-08c76b85bd75', 3);
insert into public.training_lessons (class_id, position, title, body) values
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', 1, $t$Recognize, assess, de-escalate, report$t$, $t$- CISA's model has four steps: recognize warning signs, assess the situation for safety, de-escalate if it is safe to do so, and report.
- Early signs of agitation include a raised voice, pacing, clenched fists, a flushed face, and invading personal space.
- Before you engage, ask: Is anyone in immediate danger? If yes, this is an emergency response, not a conversation. Call 911.$t$),
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', 2, $t$Your body and your voice$t$, $t$- Stay calm. Your calm is contagious, and so is your stress.
- Stand at an angle, about two arm's lengths away, with your hands open and visible.
- Speak slowly and quietly, using the person's name if you know it.
- Don't point, touch, cross your arms, or block their only exit.
- Bring a teammate. One person talks, and the other watches and radios.$t$),
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', 3, $t$Words that lower the temperature$t$, $t$- Listen first. Let them say what is wrong.
- Acknowledge feelings: "I can see you're really upset."
- Offer choices: "Would you like to talk out in the lobby or by the coffee bar?"
- Avoid commands, arguing, sarcasm, and "calm down."
- Move the conversation away from the sanctuary and children's areas when you can.
- Some people are in a mental health crisis. Be patient, keep it simple, and get help from a pastor or medical responder.$t$),
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', 4, $t$When talking isn't working$t$, $t$- Signs that it is failing: threats, closing distance, reaching for pockets or a bag, or a weapon.
- Step back, create distance, and radio the team lead.
- Call 911 and let police handle removal when someone refuses to leave or becomes violent.
- Write down what was said and done as soon as it is over.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 1, $t$What are CISA's four de-escalation steps?$t$, array[$t$Warn, push, remove, report$t$, $t$Recognize, assess, de-escalate, report$t$, $t$Listen, agree, apologize, leave$t$, $t$Observe, confront, detain, release$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 2, $t$How should you stand when talking to an upset person?$t$, array[$t$Face to face, close enough to grab them$t$, $t$At an angle, about two arm's lengths away, hands visible$t$, $t$Behind them so they can't see you$t$, $t$Arms crossed to show authority$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 3, $t$Which phrase is most likely to help?$t$, array[$t$"Calm down."$t$, $t$"You need to leave now."$t$, $t$"I can see you're really upset. Can we talk in the lobby?"$t$, $t$"That's not a big deal."$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 4, $t$Why bring a teammate?$t$, array[$t$So two people can argue with the person$t$, $t$One talks while the other watches and radios$t$, $t$Team rules require four people$t$, $t$To block the exit$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 5, $t$The person refuses to leave and starts making threats. What next?$t$, array[$t$Keep talking no matter what$t$, $t$Physically drag them out$t$, $t$Create distance, radio the team lead, and call 911$t$, $t$Ignore them until the service ends$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;

-- 4. Active Threat Response
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order) values
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', $t$Active Threat Response$t$, $t$Run, hide, fight, the safety team's job in the first minutes, what to do when police arrive, and what happens after.$t$, 45,
   (select id from public.qualifications where name = $t$Active Threat Response$t$),
   '76677062-f884-4ee6-be6b-08c76b85bd75', 4);
insert into public.training_lessons (class_id, position, title, body) values
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 1, $t$Run, hide, fight$t$, $t$- **Run:** Getting away is the top priority. Leave belongings behind, warn others if it is safe, and call 911 once you are safe.
- **Hide:** If you can't get out, get out of view and stay quiet. Silence phones, lock and barricade doors, close blinds, and turn off lights. Spread out instead of clustering.
- **Fight:** Only as a last resort when your life is in immediate danger. Commit fully, work with others, and use what is nearby, such as chairs or a fire extinguisher.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 2, $t$The safety team's job in the first minutes$t$, $t$- Sound the alarm with the agreed code word or announcement so people know to move.
- Direct people to the nearest safe exit, away from the threat. Know every exit in your zone before the service starts.
- Lock or close doors to children's areas. Teachers keep children together and follow the lockdown plan.
- Call 911 and give the location, number and description of attackers, weapons, and direction of travel.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 3, $t$When police arrive$t$, $t$- Officers go straight to the threat. They may step past injured people to stop the attacker.
- Keep your hands visible and empty. Drop anything you are holding.
- Follow every instruction and leave in the direction officers tell you.
- Armed team members should holster and follow police commands, because police won't know who is a threat.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 4, $t$After the threat$t$, $t$- Give first aid and Stop the Bleed care when the scene is safe (see Medical Emergencies, CPR/AED and Stop the Bleed).
- Move people to the reunification point. Account for children by check-in records.
- Don't post on social media or speak to media. Let church leadership and police handle communication.
- Expect stress reactions in yourself and others. Pastoral care is part of recovery.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 1, $t$In an active threat, what is the first option to consider?$t$, array[$t$Fight$t$, $t$Hide$t$, $t$Run, if there is a safe way out$t$, $t$Wait for instructions$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 2, $t$You are hiding in a classroom. Which is correct?$t$, array[$t$Gather everyone in one corner$t$, $t$Lock and barricade the door, silence phones, and spread out$t$, $t$Keep lights on so police can see$t$, $t$Open the door to check on others$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 3, $t$When should you fight?$t$, array[$t$As soon as you see the attacker$t$, $t$Only as a last resort when your life is in immediate danger$t$, $t$Never$t$, $t$Only if you are armed$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 4, $t$Police enter the building. What should you do?$t$, array[$t$Run toward them for help$t$, $t$Point out the attacker with the object in your hand$t$, $t$Keep your hands visible and empty and follow instructions$t$, $t$Ask them to help the injured first$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 5, $t$After the threat, how are children accounted for?$t$, array[$t$By asking parents to search the building$t$, $t$By using check-in records at the reunification point$t$, $t$By letting children walk home$t$, $t$By posting a list online$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;

-- 5. Medical Emergencies, CPR/AED and Stop the Bleed
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order) values
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', $t$Medical Emergencies, CPR/AED and Stop the Bleed$t$, $t$The first 60 seconds of a medical emergency, hands-only CPR and the AED, Stop the Bleed, and other common emergencies. Awareness only: it does not replace a hands-on CPR/AED card or an in-person Stop the Bleed course.$t$, 50,
   (select id from public.qualifications where name = $t$Medical Response Awareness$t$),
   '8c2eb09f-f0fd-42cb-a381-c75f6042947e', 5);
insert into public.training_lessons (class_id, position, title, body) values
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 1, $t$The first 60 seconds$t$, $t$This class is awareness only. It does not replace a hands-on American Heart Association or Red Cross CPR/AED card or an in-person Stop the Bleed course. We recommend every member take both.
- Make sure the scene is safe before you step in.
- Check whether the person responds. Tap and shout.
- Point at a specific person: "You, call 911. You, bring the AED and first aid kit."
- Radio the team so medical responders come and someone meets EMS at the door.
- Know where MRBC's AEDs, first aid kits, and bleeding control kits are kept.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 2, $t$Hands-only CPR and the AED$t$, $t$- For a teen or adult who collapses and isn't breathing normally: call 911, then push hard and fast in the center of the chest.
- Aim for 100 to 120 compressions per minute, about 2 inches deep, and let the chest fully rise between pushes.
- Turn on the AED as soon as it arrives and follow its voice prompts. It will only shock if a shock is needed.
- Keep going until EMS takes over or the person starts breathing.
- Children, infants, and drowning or overdose victims also need rescue breaths, which you learn in a hands-on course.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 3, $t$Stop the Bleed$t$, $t$- Call 911 and find where the blood is coming from.
- Apply firm, direct pressure with gauze or a clean cloth. If blood soaks through, add more on top and keep pressing.
- For a deep wound, pack it tightly with gauze and press hard.
- For severe arm or leg bleeding that pressure won't stop, apply a tourniquet 2 to 3 inches above the wound (not on a joint) and tighten until bleeding stops. Note the time it went on.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 4, $t$Other common emergencies$t$, $t$- **Fainting:** lay them down, raise their legs, and check breathing.
- **Choking:** if they can't cough or speak, give abdominal thrusts.
- **Seizure:** clear the area, cushion the head, time it, and never put anything in the mouth.
- **Stroke:** use BE FAST (balance, eyes, face, arms, speech, time) and call 911 right away.
- Write down what happened and what care was given for EMS and the incident report.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 1, $t$What should you do before helping an injured person?$t$, array[$t$Move them to the parking lot$t$, $t$Make sure the scene is safe$t$, $t$Wait for a doctor in the congregation$t$, $t$Take a photo for the report$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 2, $t$What is the correct rate for chest compressions?$t$, array[$t$40 to 60 per minute$t$, $t$60 to 80 per minute$t$, $t$100 to 120 per minute$t$, $t$As fast as possible with no limit$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 3, $t$When should you use the AED?$t$, array[$t$Only if a nurse is present$t$, $t$As soon as it arrives, following its voice prompts$t$, $t$After 10 minutes of CPR$t$, $t$Only on children$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 4, $t$Where should a tourniquet go?$t$, array[$t$Directly on the wound$t$, $t$On the nearest joint$t$, $t$2 to 3 inches above the wound, not on a joint$t$, $t$Below the wound$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 5, $t$Someone is having a seizure. What should you not do?$t$, array[$t$Time the seizure$t$, $t$Cushion their head$t$, $t$Clear the area$t$, $t$Put something in their mouth$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;

-- 6. Child Protection and Safe Check-in
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order) values
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', $t$Child Protection and Safe Check-in$t$, $t$A layered child safety system, check-in and pickup, supervision rules, grooming warning signs, and how to report.$t$, 45,
   (select id from public.qualifications where name = $t$Child Protection$t$),
   '8c2eb09f-f0fd-42cb-a381-c75f6042947e', 6);
insert into public.training_lessons (class_id, position, title, body) values
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 1, $t$A system, not a single step$t$, $t$- MinistrySafe teaches a five-part safety system: abuse awareness training, skillful screening, background checks, tailored policies, and monitoring and oversight.
- A background check alone is not enough. Most abusers have no criminal record.
- Policies only protect children if people actually follow them. The safety team helps monitor that they do.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 2, $t$Check-in and pickup$t$, $t$- Every child is checked in by a parent or guardian and gets a matching security tag.
- Only the person holding the matching tag picks up the child. No tag means the team lead and a parent are called, not an exception.
- Watch for anyone loitering near classrooms, trying doors, or asking unusual questions about kids.
- Custody issues: if a parent has given notice of a court order, the team lead knows who may not pick up.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 3, $t$Supervision rules$t$, $t$- Follow MRBC's adult-to-child policies, such as never leaving one adult alone with one child out of sight.
- Keep classroom doors open or use doors with windows.
- Follow bathroom policies, such as door-propped or same-gender helpers, as MRBC's children's ministry sets them.
- Only screened and approved workers serve in children's areas. Safety team members on patrol stay visible in hallways.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 4, $t$Warning signs and reporting$t$, $t$- Grooming often looks like special attention, gifts, secrets, or trying to get a child alone.
- If a child tells you about abuse: stay calm, listen, don't ask leading questions, and don't promise to keep it secret.
- Report right away to the children's ministry leader and pastor, and follow state reporting law. You may be a mandated reporter.
- Never investigate on your own or confront the person.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 1, $t$Why isn't a background check enough on its own?$t$, array[$t$They are too expensive$t$, $t$Most abusers have no criminal record$t$, $t$They only check driving records$t$, $t$They expire after a week$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 2, $t$A man without the matching pickup tag says he is the child's uncle. What happens?$t$, array[$t$Release the child if he seems friendly$t$, $t$Release the child if the child recognizes him$t$, $t$Don't release the child. Call the team lead and the parent$t$, $t$Ask him to come back next week$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 3, $t$Which is a common grooming behavior?$t$, array[$t$Greeting all children the same way$t$, $t$Giving one child special gifts and asking them to keep secrets$t$, $t$Following the check-in process$t$, $t$Keeping classroom doors open$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 4, $t$A child tells you someone hurt them. What should you do?$t$, array[$t$Promise to keep it a secret$t$, $t$Ask detailed questions to get the full story$t$, $t$Stay calm, listen, and report right away through MRBC's process and state law$t$, $t$Confront the person they named$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 5, $t$What does "monitoring and oversight" mean?$t$, array[$t$Installing more cameras$t$, $t$Checking that people actually follow the policies$t$, $t$Reading children's text messages$t$, $t$Reviewing the church budget$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;

-- 7. Fire Safety and Building Evacuation
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order) values
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', $t$Fire Safety and Building Evacuation$t$, $t$RACE when you find a fire, using an extinguisher with PASS, evacuating the congregation, and accounting for everyone.$t$, 35,
   (select id from public.qualifications where name = $t$Fire and Evacuation$t$),
   '8c2eb09f-f0fd-42cb-a381-c75f6042947e', 7);
insert into public.training_lessons (class_id, position, title, body) values
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 1, $t$RACE when you find a fire$t$, $t$- **Rescue:** move anyone in immediate danger away from the fire.
- **Alarm:** pull the nearest fire alarm and call 911.
- **Contain:** close doors behind you to slow the fire. Feel a door for heat before opening it.
- **Extinguish:** only if the fire is small, about the size of a trash can, and you have a clear way out.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 2, $t$Using a fire extinguisher (PASS)$t$, $t$- **Pull** the pin.
- **Aim** at the base of the fire, not the flames.
- **Squeeze** the handle.
- **Sweep** side to side at the base.
- If the fire isn't going out quickly, leave. Never let the fire get between you and the exit.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 3, $t$Evacuating the congregation$t$, $t$- Evacuate for every fire and every fire alarm. Never assume it is a false alarm.
- Know every exit in your zone. Direct people calmly, with clear words and hand signals.
- Help people with mobility needs, and assign someone to check restrooms and side rooms on the way out.
- Children's teachers keep their class together and take their roster to the meeting point.
- Never go back inside, even for belongings.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 4, $t$The meeting point and accounting for people$t$, $t$- Know MRBC's outdoor meeting points for each building, away from fire lanes.
- Teachers check rosters, and the team lead reports any missing people to the fire department.
- Keep the drive clear for fire trucks.
- Before services, check that exits are unlocked from the inside, unblocked, and that exit signs are lit.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 1, $t$What does RACE stand for?$t$, array[$t$Run, Alert, Call, Exit$t$, $t$Rescue, Alarm, Contain, Extinguish$t$, $t$Report, Assess, Clear, Evacuate$t$, $t$Rescue, Aim, Clear, Escape$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 2, $t$Where should you aim a fire extinguisher?$t$, array[$t$At the top of the flames$t$, $t$At the smoke$t$, $t$At the base of the fire$t$, $t$At the ceiling$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 3, $t$The fire alarm goes off during the sermon and nobody sees smoke. What do you do?$t$, array[$t$Wait for the pastor to decide$t$, $t$Evacuate. Treat every alarm as real$t$, $t$Silence the alarm$t$, $t$Go look for the fire alone$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 4, $t$When should you try to put out a fire yourself?$t$, array[$t$Never$t$, $t$Only if it is small and you have a clear way out$t$, $t$Always, before calling 911$t$, $t$Only if it is in the kitchen$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 5, $t$What should you check before every service?$t$, array[$t$That exits are unblocked, unlocked from inside, and signs are lit$t$, $t$That all doors are locked from both sides$t$, $t$That the fire alarm is turned off$t$, $t$That extinguishers are hidden away$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;

-- 8. Severe Weather and Shelter-in-Place
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order) values
  ('678301e7-1917-4814-b449-ac250c93bab9', $t$Severe Weather and Shelter-in-Place$t$, $t$Tornado watches and warnings, where to shelter, moving people quickly, and what to do after the storm.$t$, 30,
   (select id from public.qualifications where name = $t$Severe Weather Response$t$),
   '8c2eb09f-f0fd-42cb-a381-c75f6042947e', 8);
insert into public.training_lessons (class_id, position, title, body) values
  ('678301e7-1917-4814-b449-ac250c93bab9', 1, $t$Watch versus warning$t$, $t$- **Tornado watch:** conditions make tornadoes possible. Stay alert, and the team lead monitors weather alerts.
- **Tornado warning:** a tornado has been seen or detected. Take shelter immediately.
- On storm days, the team lead keeps a weather radio or alert app on and announces shelter areas before the service.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 2, $t$Where to shelter$t$, $t$- Large open rooms like the sanctuary and gym are dangerous because wide roofs fail in high winds.
- Move people to the lowest floor, into interior rooms and hallways, away from windows and exterior walls.
- Know MRBC's designated shelter areas for every building and post them.
- Have people crouch low and cover their heads.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 3, $t$Moving people quickly$t$, $t$- Assign each section of the sanctuary its own route to a shelter area so hallways don't jam.
- Children's teachers keep their class together and go to their assigned shelter with their roster.
- Help people with mobility needs first and early.
- Bring the first aid kit, a flashlight, and radios to the shelter area.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 4, $t$After the storm$t$, $t$- Stay sheltered until the warning expires or the all-clear is given.
- Check for injuries and give first aid.
- Watch for downed power lines, gas smells, and structural damage before anyone goes back in or outside.
- Reunite children with parents using check-in records.
- Practice the plan at least once a year so the congregation knows the routes.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 1, $t$What does a tornado warning mean?$t$, array[$t$Tornadoes are possible later today$t$, $t$A tornado has been seen or detected. Shelter now$t$, $t$The storm has passed$t$, $t$Schools are closing$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 2, $t$Why is the sanctuary a poor shelter?$t$, array[$t$It is too far from the parking lot$t$, $t$Large, wide roofs can fail in high winds$t$, $t$It is too quiet$t$, $t$There are not enough chairs$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 3, $t$Where is the best shelter?$t$, array[$t$Near the front glass doors$t$, $t$In the parking lot$t$, $t$The lowest floor, interior rooms or halls, away from windows$t$, $t$The balcony$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 4, $t$How do you keep hallways from jamming?$t$, array[$t$Let everyone leave at once$t$, $t$Assign each section its own route$t$, $t$Send everyone to one stairwell$t$, $t$Tell people to stay in their seats$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 5, $t$After the storm, what should you watch for before people move?$t$, array[$t$Downed power lines, gas smells, and structural damage$t$, $t$Whether the coffee is ready$t$, $t$Who left early$t$, $t$Nothing, it is over$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;

-- 9. Radio Communication and Incident Reporting
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order) values
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', $t$Radio Communication and Incident Reporting$t$, $t$Radio basics and discipline, and how to write an incident report that helps the team.$t$, 30,
   (select id from public.qualifications where name = $t$Communications and Reporting$t$),
   '8c2eb09f-f0fd-42cb-a381-c75f6042947e', 9);
insert into public.training_lessons (class_id, position, title, body) values
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 1, $t$Radio basics$t$, $t$- Check your radio and earpiece before the service: battery, channel, and volume.
- Listen before you talk so you don't step on someone else.
- Press, pause one second, then speak. Keep it short.
- Format: who you are calling, who you are, then the message. "Team Lead, Lobby. Need a medic at the east doors."
- Use plain language, not codes, except for the few agreed codes the team lead sets.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 2, $t$Radio discipline$t$, $t$- The congregation may hear you. Avoid names, diagnoses, and alarming words.
- Use agreed code words for emergencies, such as a medical code or a lockdown code, so you don't cause panic.
- Emergency traffic has priority. When someone calls an emergency, everyone else stays off the channel.
- If radios fail, use a runner or a phone call to the team lead.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 3, $t$Writing an incident report$t$, $t$- File a report in the MRBC Safety Team app for every incident, even small ones like a minor fall or a disruptive visitor.
- Write it the same day while memory is fresh.
- Record who, what, when, where, and what was done. Include names of witnesses and responders.
- Stick to facts you saw and heard. Quote what people said. Don't guess at motives or diagnoses.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 4, $t$Why reports matter$t$, $t$- Reports show patterns, such as the same person causing problems or the same door left unlocked.
- They protect the church and team members if questions come up later.
- They help leadership decide where training and equipment are needed.
- Reports are confidential. Share them only with team leadership.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 1, $t$What should you do before pressing the talk button?$t$, array[$t$Shout to get attention$t$, $t$Listen to make sure the channel is clear$t$, $t$Turn the volume all the way up$t$, $t$Switch channels$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 2, $t$Which radio call is best?$t$, array[$t$"Hey, uh, someone fell, maybe, I think it's Mrs. Jones and she might be having a stroke"$t$, $t$"Team Lead, Lobby. Need a medic at the east doors"$t$, $t$"Emergency! Emergency!"$t$, $t$"Can someone come here?"$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 3, $t$Why avoid names and diagnoses on the radio?$t$, array[$t$Radios can't transmit names$t$, $t$Others in the congregation may hear$t$, $t$It takes too long$t$, $t$Names are against the law$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 4, $t$When should you file an incident report?$t$, array[$t$Only if police were called$t$, $t$Only if someone was hurt$t$, $t$For every incident, the same day$t$, $t$At the end of the month$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 5, $t$What belongs in an incident report?$t$, array[$t$Your guess about why the person did it$t$, $t$Facts you saw and heard, with who, what, when, and where$t$, $t$Opinions about the person's character$t$, $t$Only the date$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;

-- 10. Greeters, Ushers, Entrances and Parking Lot
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order) values
  ('89fb1e88-4837-4912-a653-6912f996ee61', $t$Greeters, Ushers, Entrances and Parking Lot$t$, $t$Greeters and ushers as the first layer of eyes, controlling entrances, watching the parking lot, and handling the offering.$t$, 35,
   (select id from public.qualifications where name = $t$Entry and Exterior Safety$t$),
   '76677062-f884-4ee6-be6b-08c76b85bd75', 10);
insert into public.training_lessons (class_id, position, title, body) values
  ('89fb1e88-4837-4912-a653-6912f996ee61', 1, $t$Greeters and ushers are the first layer of eyes$t$, $t$- A warm greeting is also a security tool. Making eye contact and saying hello lets you read someone's mood and lets them know they are seen.
- Notice who seems agitated, unusually nervous, or doesn't fit the baseline (see Situational Awareness), and quietly tell the safety team.
- Ushers know the seating, the exits, and where the safety team members are posted.
- Greeters and ushers report. The safety team responds.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 2, $t$Controlling entrances$t$, $t$- Limit open doors during services to the ones the team can watch. Lock the rest from the outside while keeping them usable as exits.
- Lock or staff doors near the children's wing once services start.
- Never prop exterior doors open.
- Close doors after the service begins and have a team member near the main entrance for latecomers.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 3, $t$Parking lot and exterior$t$, $t$- Walk the lot before and during services. Look for people sitting in cars a long time, vehicles in fire lanes, and anyone checking car doors.
- Note plate numbers and descriptions of anything suspicious and report it.
- Help people get safely from their cars, especially at night and in bad weather.
- Check that exterior lights work and that bushes don't block sightlines.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 4, $t$The offering and money handling$t$, $t$- At least two unrelated people handle the offering at all times.
- Vary the route and timing for moving money, and escort counters to the counting room.
- Never discuss amounts or deposit times in public.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 1, $t$Why is a warm greeting a security tool?$t$, array[$t$It slows people down at the door$t$, $t$It lets you read someone's mood and shows they are seen$t$, $t$It lets you search their bags$t$, $t$It counts attendance$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 2, $t$What is the greeter's role when they notice something concerning?$t$, array[$t$Confront the person$t$, $t$Quietly report it to the safety team$t$, $t$Call the person's family$t$, $t$Ignore it to stay friendly$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 3, $t$What should happen to exterior doors during a service?$t$, array[$t$Prop them open for airflow$t$, $t$Leave all of them unlocked$t$, $t$Keep only watched doors open. Others stay locked from outside but work as exits$t$, $t$Chain them shut$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 4, $t$Someone has sat in a car for 40 minutes watching the entrance. What do you do?$t$, array[$t$Knock on the window and demand they leave$t$, $t$Note the plate and description and report it to the team lead$t$, $t$Take their photo and post it online$t$, $t$Nothing, it is a public lot$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 5, $t$How many people should handle the offering?$t$, array[$t$One trusted person$t$, $t$At least two unrelated people$t$, $t$Whoever is available$t$, $t$Only the pastor$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;

