-- More classes (Matt, 2026-10-29): two new classes, each about 28 to 30
-- minutes read aloud, with a practice question on every slide, a 10-question
-- quiz, and its own certification. They start as drafts until an admin approves.
-- Safe to run more than once: each class's slides and quiz are replaced.

-- Class 11: Mental Health Crises and Suicide Awareness
insert into public.qualifications (name, description, valid_months) values ($t$Mental Health Crisis Response$t$, $t$Earned by passing the Mental Health Crises and Suicide Awareness class.$t$, 24) on conflict (name) do nothing;
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order, status) values
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', $t$Mental Health Crises and Suicide Awareness$t$, $t$Recognizing a mental health crisis, helping with panic and psychosis, asking about suicide, connecting people to 988 and other help, and caring for everyone afterward.$t$, 30, (select id from public.qualifications where name = $t$Mental Health Crisis Response$t$), '8c2eb09f-f0fd-42cb-a381-c75f6042947e', 11, 'draft')
  on conflict (id) do nothing;
delete from public.training_lessons where class_id = 'b61f270c-935a-447b-98e2-d41ef8a0252b';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 1, $t$Why this matters at church$t$, $t$When people are struggling, the church is often one of the first places they turn. Someone may come to a service after losing a job, a marriage, or a child. Others carry depression, anxiety, or serious mental illness quietly for years. Some arrive in the middle of a crisis.
About one in five adults in the United States lives with a mental health condition in a given year, according to the National Institute of Mental Health. That means every Sunday, people in our pews are carrying burdens we can't see.
The safety team isn't here to diagnose or counsel. Our role is narrower and just as important:
- **Recognize** when someone may be in crisis.
- **Respond** calmly, keeping them and others safe.
- **Connect** them to the right help, whether that's a pastor, a crisis line, or emergency services.
This class builds on the de-escalation skills from the Verbal De-escalation class and focuses on crises that come from inside a person rather than conflict between people.$t$, null, $t$What is the safety team's role when someone is in a mental health crisis?$t$, array[$t$Stay out of it, since it's a private matter$t$, $t$Recognize the crisis, keep everyone safe, and connect the person to help$t$, $t$Diagnose the condition and recommend treatment$t$], 1, $t$We aren't counselors. We notice, keep people safe, and get them to someone who can help.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 2, $t$What a crisis can look like$t$, $t$A mental health crisis is any situation where a person's thoughts, emotions, or behavior put them at risk or leave them unable to cope. It doesn't always look dramatic.
Signs can include:
- Sudden, intense distress: sobbing that won't stop, shaking, or rapid breathing.
- Extreme agitation, pacing, or shouting with no clear cause.
- Confusion about where they are, or speech that doesn't make sense.
- Seeing or hearing things others don't.
- Withdrawal so complete they won't respond, or staring blankly.
- Talking about feeling hopeless, trapped, or like a burden.
Some of these signs can also come from medical problems like low blood sugar, a stroke, a head injury, or a reaction to medication. If something seems physically wrong, or you're not sure, treat it as a medical emergency first.
Trust your sense that something is off. Approaching gently and asking "Are you okay? I noticed you seem upset" costs nothing and may matter a great deal.$t$, null, $t$A man in the back row suddenly seems confused, and his speech isn't making sense. What should you consider first?$t$, array[$t$He's probably having a psychiatric episode$t$, $t$It could be a medical emergency like a stroke or low blood sugar, so check that first$t$, $t$He's probably just tired$t$], 1, $t$Confusion and garbled speech can be medical. Rule that out and call 911 if you're unsure.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 3, $t$Panic and severe anxiety$t$, $t$Panic attacks are among the most common crises you'll see. They can come on suddenly and feel terrifying. The person may feel like they're having a heart attack, losing control, or dying.
Common signs include a racing heart, chest tightness, shortness of breath, trembling, sweating, dizziness, and a strong urge to escape.
How to help:
- Move them somewhere quieter if they're willing, away from crowds and noise.
- Stay calm and speak slowly. Your calm helps them find theirs.
- Reassure them: "You're safe. This will pass. I'm going to stay with you."
- Guide their breathing. Breathe in slowly for four counts, then out for six, together.
- Ask them to name things they can see and hear around them, which helps bring their attention back to the present.
- Don't tell them to calm down or that it's all in their head.
Panic attacks usually peak within ten minutes. But chest pain, trouble breathing, and fainting can also be heart problems. If the person has never had a panic attack before, has heart risk factors, or isn't improving, call 911.$t$, null, $t$A woman in the lobby says her heart is racing and she can't breathe. She says this has happened before with panic attacks. How do you help?$t$, array[$t$Tell her to calm down, since it's just anxiety$t$, $t$Leave her alone so she can recover privately$t$, $t$Move her somewhere quiet, stay with her, and breathe slowly with her, calling 911 if she doesn't improve$t$], 2, $t$Calm presence and slow breathing help most. Call 911 if anything seems off or it isn't easing.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 4, $t$When reality seems different$t$, $t$Some people experience psychosis, a state where they lose touch with what others see as reality. They may hear voices, see things that aren't there, or hold strong beliefs that aren't true, such as being followed or being sent a special message.
Psychosis can be frightening for the person and for those around them. Most people experiencing it aren't violent, and they're more likely to be victims of violence than causes of it.
How to respond:
- Speak calmly, simply, and slowly. Use short sentences.
- Don't argue about what they're experiencing, and don't pretend to agree. Focus on feelings: "That sounds really frightening."
- Reduce noise and the number of people around them. One person talks.
- Give them space. Don't touch them without asking, and avoid sudden movements.
- Ask simple questions: "Is there someone we can call for you? Do you have a doctor or a case worker?"
If they seem to be a danger to themselves or others, or can't take care of themselves, call 911 and tell the dispatcher it's a mental health crisis.$t$, null, $t$A visitor tells you the people in the choir are sending him secret messages. What's the best response?$t$, array[$t$Explain that it isn't true$t$, $t$Stay calm, acknowledge how it feels to him, keep things quiet, and ask who you can call for him$t$, $t$Agree with him so he stays calm$t$], 1, $t$Arguing or agreeing both backfire. Acknowledge the feeling and focus on safety and connection.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 5, $t$Suicide: what to know$t$, $t$Suicide is one of the leading causes of death in the United States, and it touches nearly every congregation. Many people who die by suicide gave signs beforehand, and many reached out to someone in some way.
The American Foundation for Suicide Prevention describes three kinds of warning signs:
- **Talk:** saying they want to die, feel hopeless, have no reason to live, are a burden, or feel trapped or in unbearable pain.
- **Behavior:** withdrawing from people, giving away possessions, saying goodbye, searching for ways to end their life, increased alcohol or drug use, or acting recklessly.
- **Mood:** depression, anxiety, irritability, shame, sudden rage, or a sudden calm after a period of deep depression.
Risk rises after major losses, such as a death, divorce, job loss, or health diagnosis, and around anniversaries of those losses.
Faith communities can be a powerful protective factor. Belonging, hope, and people who notice and care all lower risk. Noticing is where it starts.$t$, null, $t$A longtime member who has been depressed suddenly seems calm and has started giving away cherished belongings. What should you think?$t$, array[$t$He's finally doing better$t$, $t$It's a normal part of getting older$t$, $t$These can be warning signs of suicide, and it's worth checking on him$t$], 2, $t$Sudden calm after depression and giving away possessions are known warning signs. Reach out.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 6, $t$Asking directly$t$, $t$If you're worried someone is thinking about suicide, the most important thing you can do is ask them directly.
Many people fear that asking will put the idea in someone's head. Research shows it doesn't. Asking directly shows that you care, that you're not afraid of the answer, and that it's safe to talk. Many people feel relief when someone finally asks.
How to ask:
- Find a private moment, away from others.
- Be direct and clear: "Are you thinking about killing yourself?" or "Are you thinking about suicide?"
- Avoid vague or leading questions like "You're not thinking of doing something stupid, are you?" which signal what answer you want.
- Stay calm, whatever the answer.
If the answer is yes, thank them for telling you. Don't panic, lecture, or try to talk them out of their feelings. The next steps are to listen, keep them safe, and connect them to help.
If the answer is no but you're still worried, say so, and make sure they know how to reach help.$t$, null, $t$Why is it important to ask someone directly whether they're thinking about suicide?$t$, array[$t$It's required by law$t$, $t$Asking directly doesn't plant the idea, and it shows you're safe to talk to$t$, $t$So you can report them to the police$t$], 1, $t$Asking clearly and calmly opens the door. It doesn't increase risk.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 7, $t$Listen, stay, and don't promise secrecy$t$, $t$Once someone opens up, how you respond shapes what they do next.
Many crisis programs teach a simple sequence called QPR: Question, Persuade, Refer. You've just learned to question. Persuading and referring start with listening.
- **Listen without judging.** Let them talk. Don't argue that things aren't that bad or remind them how much they have to live for.
- **Take it seriously.** Every mention of suicide deserves a real response.
- **Stay with them.** Don't leave someone alone if you believe they're at risk. If you need to make a call, have a teammate stay.
- **Don't promise to keep it secret.** Say, "I care about you too much to keep this to myself. Let's get you some help together."
- **Persuade them to accept help.** Ask, "Will you go with me to talk to someone? Will you let me help you call?"
You don't need the perfect words. Your presence and willingness to listen matter more than anything you say.$t$, null, $t$A teen tells you she's thinking about ending her life but begs you not to tell anyone. What do you say?$t$, array[$t$"I care about you too much to keep this to myself. Let's get help together."$t$, $t$"You have so much to live for. Don't think like that."$t$, $t$"I promise this stays between us."$t$], 0, $t$Never promise secrecy about suicide. Stay with her and connect her to help.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 8, $t$Connecting to help$t$, $t$Referring means getting the person to someone who can help, ideally with you beside them.
- **988 Suicide and Crisis Lifeline:** call or text 988, or chat at 988lifeline.org, any time, day or night. Trained counselors answer. You can call with the person, or call for advice about how to help someone.
- **911:** call when there's an immediate danger, such as an attempt in progress, a weapon, or the person refusing to stay safe.
- **A pastor:** MRBC's pastors can provide spiritual care and follow-up, and help the family. Pastoral care works alongside professional help, not in place of it.
- **Their own supports:** a counselor, doctor, family member, or friend they trust.
A warm handoff works far better than a phone number on a slip of paper. Make the call together, walk them to the pastor's office, or wait with them until a family member arrives.
Keep 988 in your phone, and know how to reach the pastor on call during services.$t$, null, $t$A man tells you he's been thinking about suicide but isn't in immediate danger. What's the best next step?$t$, array[$t$Offer to call 988 with him or walk him to a pastor, and stay with him$t$, $t$Give him the 988 number and let him go$t$, $t$Call the police right away$t$], 0, $t$A warm handoff, where you stay with him while he connects to help, makes it far more likely he gets it.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 9, $t$Keeping lethal means away$t$, $t$One of the most effective ways to prevent suicide is to put time and distance between a person in crisis and the most lethal ways to end their life. Many suicidal crises are brief. If the means aren't close at hand, the crisis often passes.
In the United States, firearms are involved in more than half of suicide deaths. Medications are another common method.
What this means for the team:
- If someone at risk mentions having a gun or stockpiled pills, take it seriously and include it in what you tell the professionals who help them.
- Family members can be encouraged to store firearms away from the home temporarily, lock up medications, or ask a pharmacist how to safely dispose of extras.
- Don't try to take a weapon from someone yourself. If a person in crisis is holding a weapon or has one within reach, it's an emergency. Move others away and call 911.
Conversations about means safety are about caring for a person during a dangerous time, not about taking rights away.$t$, null, $t$A woman says her husband has been talking about suicide and keeps a handgun in the nightstand. What could help?$t$, array[$t$Encourage her to have the gun stored outside the home for now, and connect them with 988 or a pastor$t$, $t$Tell her it's nothing to worry about$t$, $t$Go to their home and remove the gun yourself$t$], 0, $t$Putting distance between someone in crisis and lethal means saves lives. Help the family do it safely.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 10, $t$When there's immediate danger$t$, $t$Sometimes a crisis can't wait: a person has a weapon, has taken pills, is threatening to jump, or is hurting themselves.
- **Call 911 right away.** Tell the dispatcher it's a mental health crisis and whether a weapon is involved. Many areas have officers trained in crisis intervention, sometimes called CIT officers, or mobile crisis teams. Ask if one is available.
- **Keep yourself and others safe.** Move bystanders, especially children, away. Don't block their only exit, and keep your own exit open.
- **Don't physically restrain them** unless someone is about to be seriously hurt and you're trained and authorized to act.
- **Keep talking if it's safe.** Calm, simple words, at a distance, can keep a person engaged until help arrives.
- **If they've taken something,** tell dispatch what and how much if you know, and keep any pill bottles to give to medics.
When officers arrive, give them a short summary and let them take over.$t$, null, $t$A man in the parking lot is holding a knife and saying he wants to die. What's your first move?$t$, array[$t$Leave him alone to calm down$t$, $t$Try to grab the knife$t$, $t$Keep your distance, move others away, and call 911, telling them it's a mental health crisis with a weapon$t$], 2, $t$A weapon makes it an emergency. Distance and a clear 911 call come first.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 11, $t$Grief and trauma$t$, $t$After a death in the church family, a tragedy in the community, or a frightening incident at church, many people will be shaken. Most aren't in a mental health crisis, but they need care.
Psychological first aid is a simple approach used by disaster responders:
- **Look:** notice who seems most affected. Look for people who are crying, numb, frozen, or wandering.
- **Listen:** approach gently, offer basic comfort like water or a quiet seat, and let them talk if they want to. Don't push for details.
- **Link:** help them connect with family, a pastor, or practical help like a ride home.
Common reactions to trauma include shock, trouble concentrating, sleeplessness, irritability, and replaying events. These usually ease over days and weeks. Reactions that grow worse or last more than a month deserve professional help.
Avoid saying things like "everything happens for a reason" or "at least it wasn't worse." Simple presence is more comforting than explanations.$t$, null, $t$After a frightening incident during a service, a woman is sitting alone in the hallway, staring and trembling. How do you help?$t$, array[$t$Ask her to describe exactly what she saw$t$, $t$Tell her it's over and she should go home$t$, $t$Sit with her, offer water or a quiet place, and help her connect with family or a pastor$t$], 2, $t$Psychological first aid means look, listen and link, without pushing for details.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 12, $t$Children and teens$t$, $t$Young people experience mental health crises too, and the rates of depression, anxiety, and suicidal thoughts among teens have risen sharply in recent years.
Signs in children and teens can include:
- Pulling away from friends, activities, or youth group.
- Sudden changes in grades, sleep, eating, or appearance.
- Self-harm, such as cuts or burns, often hidden under long sleeves.
- Talk of death, or posts online about hopelessness or wanting to disappear.
- Being bullied, or a breakup or family crisis.
When a young person opens up, use the same steps: ask directly, listen, don't promise secrecy, and connect them to help. Tell the youth or children's ministry leader, and involve parents unless doing so would put the child at risk, such as in cases of abuse.
988 is available to young people too, and many teens prefer to text.
If a child or teen is in immediate danger, call 911 and stay with them.$t$, null, $t$During youth group, you notice fresh cuts on a teen's forearm when her sleeve slides up. What should happen?$t$, array[$t$Pretend you didn't notice to avoid embarrassing her$t$, $t$Talk with her privately and kindly, then let the youth leader know so she and her parents get help$t$, $t$Announce to the group that self-harm is dangerous$t$], 1, $t$Self-harm is a sign of pain. Respond privately and kindly, and make sure she's connected to help.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 13, $t$After the crisis$t$, $t$When a crisis is over, a few steps help the person and the team.
- **Follow up.** With the person's permission, the pastor or a trusted member checks in over the next days. A call or a visit can mean a great deal. The period after a crisis can carry higher risk.
- **Protect their privacy.** Share only what's needed with those helping. Don't discuss it with others in the congregation.
- **Document carefully.** File an incident report that describes what you saw and did, without diagnoses or labels. Write "He said he wanted to die and was holding a knife," not "He was suicidal and unstable."
- **Welcome them back.** People who have been through a crisis often fear judgment when they return. Greet them warmly and normally.
- **Debrief the team.** Talk through what happened, what went well, and what to improve. Check on anyone who was shaken.$t$, null, $t$A member who had a crisis at church last month comes back for the first time. How should the team greet him?$t$, array[$t$Welcome him warmly and normally, without bringing up what happened$t$, $t$Ask him if he's feeling better now in front of others$t$, $t$Keep an eye on him in case it happens again$t$], 0, $t$A warm, normal welcome tells him he still belongs. Privacy and dignity matter.$t$),
  ('b61f270c-935a-447b-98e2-d41ef8a0252b', 14, $t$A church that's ready$t$, $t$The best crisis response starts long before a crisis.
- **Keep a resource list** with 988, local crisis services, counseling options, and support groups, and make it easy to find.
- **Train more people.** Courses like Mental Health First Aid and QPR gatekeeper training are short and widely available. Consider sending team members, greeters, and youth leaders.
- **Talk about it.** When church leaders speak openly about mental health, people are more likely to ask for help before a crisis.
- **Plan for services.** Know which pastor is on call, where a quiet room is, and who on the team is best at calming people.
- **Remember the whole person.** Mental illness is an illness, not a lack of faith. People can follow Christ and still need a counselor or medication.
Our job is to make sure nobody at MRBC has to face their darkest moment alone.$t$, null, $t$Which step helps a church be ready for mental health crises before they happen?$t$, array[$t$Avoid the topic so nobody feels uncomfortable$t$, $t$Leave it all to professionals outside the church$t$, $t$Train team members and leaders in courses like Mental Health First Aid or QPR$t$], 2, $t$Training and open conversation help more people notice early and respond well.$t$);

-- Class 11: Mental Health Crises and Suicide Awareness (quiz)
delete from public.training_questions where class_id = 'b61f270c-935a-447b-98e2-d41ef8a0252b';
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('b61f270c-935a-447b-98e2-d41ef8a0252b', 1, $t$What are the three parts of the team's role in a mental health crisis?$t$, array[$t$Diagnose, treat, and follow up$t$, $t$Recognize, respond, and connect$t$, $t$Pray, wait, and report$t$, $t$Observe, confront, and remove$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('b61f270c-935a-447b-98e2-d41ef8a0252b', 2, $t$Why should you consider a medical cause when someone seems suddenly confused?$t$, array[$t$It avoids talking to them$t$, $t$Police require it$t$, $t$Medical problems are more common in church$t$, $t$Conditions like stroke or low blood sugar can look like a mental health crisis$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('b61f270c-935a-447b-98e2-d41ef8a0252b', 3, $t$Which helps most during a panic attack?$t$, array[$t$Giving them coffee$t$, $t$Staying calm and breathing slowly with them$t$, $t$Leaving them alone$t$, $t$Telling them it's all in their head$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('b61f270c-935a-447b-98e2-d41ef8a0252b', 4, $t$How should you respond to someone experiencing psychosis?$t$, array[$t$Raise your voice so they focus$t$, $t$Pretend to agree$t$, $t$Speak simply, acknowledge their feelings, and reduce noise and crowds$t$, $t$Argue with what they believe$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('b61f270c-935a-447b-98e2-d41ef8a0252b', 5, $t$Which is a warning sign of suicide?$t$, array[$t$Giving away possessions and saying goodbye$t$, $t$Coming to church more often$t$, $t$Asking for prayer for a sick relative$t$, $t$Joining a small group$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('b61f270c-935a-447b-98e2-d41ef8a0252b', 6, $t$Does asking someone directly about suicide increase their risk?$t$, array[$t$Only for teenagers$t$, $t$Only if they are depressed$t$, $t$Yes, it can put the idea in their head$t$, $t$No, it shows care and makes it safe to talk$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('b61f270c-935a-447b-98e2-d41ef8a0252b', 7, $t$What do the letters QPR stand for?$t$, array[$t$Quiet, Pray, Report$t$, $t$Question, Persuade, Refer$t$, $t$Question, Protect, Restrain$t$, $t$Quick Personal Response$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('b61f270c-935a-447b-98e2-d41ef8a0252b', 8, $t$What number reaches the Suicide and Crisis Lifeline by call or text?$t$, array[$t$411$t$, $t$211$t$, $t$988$t$, $t$311$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('b61f270c-935a-447b-98e2-d41ef8a0252b', 9, $t$Why does keeping lethal means away from someone in crisis save lives?$t$, array[$t$Many suicidal crises are brief, and time and distance let them pass$t$, $t$It's required by law$t$, $t$It prevents arrests$t$, $t$It makes the person angry enough to stop$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('b61f270c-935a-447b-98e2-d41ef8a0252b', 10, $t$What should you tell a 911 dispatcher when calling about someone in crisis?$t$, array[$t$Only the address$t$, $t$That it's a mental health crisis, and whether there's a weapon$t$, $t$The person's diagnosis$t$, $t$Nothing until police arrive$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
update public.training_classes set minutes = 30 where id = 'b61f270c-935a-447b-98e2-d41ef8a0252b';

-- Class 12: Trips, Off-Site Events and Transportation
insert into public.qualifications (name, description, valid_months) values ($t$Trip and Transportation Safety$t$, $t$Earned by passing the Trips, Off-Site Events and Transportation class.$t$, 24) on conflict (name) do nothing;
insert into public.training_classes (id, title, summary, minutes, qualification_id, prerequisite_id, sort_order, status) values
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', $t$Trips, Off-Site Events and Transportation$t$, $t$Planning church trips safely: forms and rosters, drivers and vehicles, headcounts, missing persons, water safety, overnight stays, emergencies away from home, and getting everyone home.$t$, 30, (select id from public.qualifications where name = $t$Trip and Transportation Safety$t$), '8c2eb09f-f0fd-42cb-a381-c75f6042947e', 12, 'draft')
  on conflict (id) do nothing;
delete from public.training_lessons where class_id = 'e0e23b1a-e080-4b3e-98b1-406a29c3ada2';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 1, $t$Why trips need a plan$t$, $t$Some of the best moments in church life happen away from the building: youth retreats, mission trips, choir tours, senior outings, and summer camp. They're also when we're most exposed. On a trip, the things that keep people safe on Sunday are missing. There are no familiar exits, no team on the radio, no locked children's wing, and often no one nearby who knows our people.
Travel adds its own risks. Motor vehicle crashes are a leading cause of death for young people in the United States, and drowning is a leading cause of death for children, according to the Centers for Disease Control and Prevention. Both are risks that come with trips.
The answer isn't to stop going. It's to plan so that the safety system travels with the group:
- A named trip leader who is responsible from departure to return.
- A contact at home who knows the plan.
- Written information about every person on the trip.
- Clear rules for drivers, vehicles, water, and lodging.$t$, null, $t$What's the main goal of trip safety planning?$t$, array[$t$To make sure the church's safety system travels with the group$t$, $t$To make the trip leader handle every problem alone$t$, $t$To discourage the church from taking trips$t$], 0, $t$Trips are worth taking. The plan keeps leaders, information, and rules in place away from home.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 2, $t$Planning and approval$t$, $t$Every trip should be approved by church leadership well before it happens, usually at least a month ahead for overnight or out-of-state travel. A trip plan should answer these questions in writing:
- Where are we going, and what's the full schedule, including stops?
- Who is the trip leader, and who is second in charge?
- How many adults and how many minors are going? Use the same adult-to-child ratios and screening as the church's children's ministry.
- How are we getting there, and who is driving?
- What activities carry extra risk, such as swimming, hiking, or zip lines?
- Where is the nearest hospital to each place we'll stay?
Before approving, check the destination yourself or call ahead. Ask venues whether they have lifeguards, first aid staff, security, and an emergency plan.$t$, null, $t$Which question should a written trip plan answer?$t$, array[$t$Which songs will be sung on the bus$t$, $t$What snacks each person prefers$t$, $t$Where the nearest hospital is to each place the group will stay$t$], 2, $t$Knowing the nearest hospital ahead of time saves minutes when someone is hurt far from home.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 3, $t$Forms, rosters, and medical information$t$, $t$Away from home, you can't call a parent across the hall or look someone up in the church office. The information has to come with you.
For every minor, collect a signed permission form and a medical consent form before departure. The medical form should list allergies, medications, health conditions, insurance, and two emergency contacts. Many hospitals need a parent's written consent to treat a minor when no parent is present. Build a roster with every traveler's name, emergency contacts, and which vehicle and room they're assigned to.
- The trip leader carries the forms in a folder or a secured digital copy.
- One complete copy stays with the home contact at church.
- Medications are handed to a named adult who keeps them secure and logs each dose, unless it's an emergency medicine like an inhaler or epinephrine, which the person keeps with them.
Treat these forms as confidential. Don't post the roster or share medical details beyond the leaders who need them.$t$, null, $t$A teen on the trip carries an epinephrine auto-injector. Where should it be kept?$t$, array[$t$Locked in the leader's suitcase$t$, $t$With the teen, so it's available immediately$t$, $t$At home, since the trip is short$t$], 1, $t$Emergency medicines stay with the person. Other medications go to a named adult who logs each dose.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 4, $t$Choosing drivers$t$, $t$The driver holds everyone's life in their hands, so not every willing volunteer should drive. Check the church's insurance policy first, because it may set the rules. Common requirements include:
- A minimum age, often 21 or 25.
- A valid license for the vehicle, held for several years.
- A motor vehicle record check showing no recent serious violations, such as driving under the influence or reckless driving.
- Experience with the vehicle. A large van or a bus handles very differently from a car, and some vehicles require a commercial license.
If volunteers drive their own cars, confirm they carry current insurance and that every passenger has a working seat belt. Children must ride in the car seat or booster seat that state law requires for their age and size, and children under thirteen belong in the back seat.
Have a second approved driver for any long trip. A driver should never be alone in a vehicle with a single minor who isn't their own child. Plan routes so there are at least two adults, or three or more people, in each vehicle.$t$, null, $t$A volunteer offers to drive four teens in his car. What should you confirm first?$t$, array[$t$That his car has a good stereo$t$, $t$That he's an approved driver with current insurance and a seat belt for every passenger$t$, $t$Nothing, since he's a regular attender$t$], 1, $t$Drivers need approval, screening, insurance, and a belt for every passenger before the trip.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 5, $t$Checking the vehicle$t$, $t$Before any trip, someone should walk around and inspect every vehicle, whether it's the church van, a rental, or a volunteer's car.
- **Tires:** check pressure when the tires are cold, using the number on the driver's door sticker, not the tire sidewall. Look for worn tread and bulges.
- **Lights:** headlights, brake lights, and turn signals all working.
- **Fluids and warnings:** no dashboard warning lights, and fluids at proper levels.
- **Safety gear:** a first aid kit, flashlight, reflective triangles, and a phone charger.
Fifteen-passenger vans need extra care. The National Highway Traffic Safety Administration warns that their rollover risk rises sharply as they're loaded, especially when tires are underinflated. Never exceed the seating capacity, never load cargo on the roof, and when the van isn't full, seat passengers in front of the rear axle. Everyone wears a seat belt in every seat on every trip.
If anything fails the inspection, the vehicle doesn't go until it's fixed.$t$, null, $t$A fifteen-passenger van is only half full. Where should passengers sit?$t$, array[$t$In front of the rear axle, to keep the van more stable$t$, $t$In the back rows, to leave room up front$t$, $t$Anywhere, since it isn't full$t$], 0, $t$Weight behind the rear axle and on the roof makes these vans more likely to roll over.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 6, $t$On the road$t$, $t$Most crashes come from a few causes: distraction, fatigue, speed, and impairment.
- **Phones down.** The driver doesn't text, call, or use apps while moving. A front-seat passenger handles navigation and messages.
- **Rest.** Drivers should be well rested before the trip. Switch drivers or take a break about every two hours, and limit any one driver's time behind the wheel to a reasonable day.
- **Speed.** Drive at or below the limit, and slower in rain, wind, or construction zones. Large vans need more distance to stop.
- **Order in the vehicle.** Passengers stay seated and buckled. Assign an adult who isn't driving to manage passengers.
- **Caravans.** If you're traveling in several vehicles, don't try to stay bumper to bumper. Share the route and the next stop with each driver instead, and keep in touch by phone through a passenger.
Drowsy driving is dangerous because drivers rarely notice how tired they are. Yawning, drifting from the lane, or missing an exit are signs to pull over now, not at the next town.$t$, null, $t$The driver starts yawning and drifts onto the rumble strip. What should happen?$t$, array[$t$Open the window and push on to the destination$t$, $t$Turn up the music and keep going$t$, $t$Pull over at the next safe spot and switch drivers or rest$t$], 2, $t$Drifting and yawning mean fatigue has already set in. Stop and change drivers.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 7, $t$Headcounts and buddies$t$, $t$The most common way people get lost on a trip is simple: the group moves, and someone isn't with it. Prevent that with routine headcounts and a buddy system.
Count at every transition: before leaving, after every stop, when entering and leaving a venue, at meals, and before lights out. Assign each adult a small group of the same people for the whole trip, so each leader knows exactly who to look for. When the count is right, the leader reports it to the trip leader, who confirms the total before anyone moves.
Use a name roll call, not just a number. Counting heads can include a stranger or count the same child twice.
Pair everyone with a buddy, and teach the rule: you never go anywhere without your buddy, including the restroom. Buddies check on each other at every headcount.
Each morning, take a group photo. If someone does go missing, you'll have a picture of what they're wearing that day.$t$, null, $t$Why use a roll call of names rather than just counting heads?$t$, array[$t$Counting can include a stranger or count someone twice, while names confirm each person is there$t$, $t$It takes less time$t$, $t$It's the only way to count teenagers$t$], 0, $t$A number can hide a mistake. Names confirm the right people are present.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 8, $t$Stops and arrivals$t$, $t$Rest stops, gas stations, and drop-off points are where people get left behind or wander off.
- Before the doors open, tell everyone how long the stop is and where to meet.
- An adult goes into public restrooms ahead of children, or stands right outside, and younger children go in groups. Follow the two-adult rules from the Child Protection class.
- Nobody returns to the vehicle alone in a parking lot.
- Do a full roll call before the vehicle moves again. The driver doesn't pull away until the count is confirmed.
At a crowded venue such as a theme park, stadium, or convention:
- Pick a meeting point that's easy to find, and show it to everyone on arrival.
- Give each minor a card or wristband with the trip leader's phone number, and make sure older kids have it in their phones.
- Point out uniformed staff and tell kids that, if they're separated, they should go to a staff member or the meeting point and stay put.$t$, null, $t$A child is separated from the group at a theme park. What should they have been taught to do?$t$, array[$t$Go to a uniformed staff member or the meeting point and stay put$t$, $t$Walk back to the bus$t$, $t$Search the park until they find the group$t$], 0, $t$A child who stays put is found faster. Teach them where to go before anyone separates.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 9, $t$When someone goes missing$t$, $t$If a headcount comes up short, act immediately. The first minutes matter most.
1. Confirm quickly. Recount by name and ask buddies and group members when and where they last saw the person.
2. Keep the rest of the group together with assigned adults. Don't send kids searching.
3. Send adults to check the last known location, restrooms, and the meeting point.
4. Alert the venue's staff or security right away.
5. If a child isn't found within a few minutes, or there's any sign of danger or water nearby, call 911. Don't wait to be sure.
Give responders a clear description: name, age, height, hair, clothing, last known location, and the morning's group photo. Then call the child's parents and the home contact. Parents should hear it from the trip leader, not from social media.
If the person is found, recount the whole group before moving on and file a report when you get home.$t$, null, $t$A ten-year-old is missing from the group at a mall. When should you call 911?$t$, array[$t$After an hour of searching$t$, $t$Only if the parents ask you to$t$, $t$Within a few minutes if they aren't found, or immediately if there's danger$t$], 2, $t$Early calls bring more searchers and stop exits. Waiting costs the most valuable minutes.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 10, $t$Water safety$t$, $t$Water activities need their own plan, because drowning is fast and often silent. A person in trouble usually can't call or wave for help. They may simply slip under within a minute or two,.
- Swim only where a lifeguard is on duty. A lifeguard doesn't replace leader supervision.
- Ask parents on the permission form whether their child can swim, and test or limit weaker swimmers to shallow areas.
- Assign a **water watcher**, an adult whose only job is to watch swimmers. No phone, no conversations, and a handoff to another adult before they step away.
- Use buddy checks often. The leader calls out, and each buddy pair grabs hands and holds them up.
- Everyone in a boat, canoe, or kayak wears a properly fitted Coast Guard approved life jacket.
- Open water like lakes, rivers, and oceans is riskier than pools. Watch for currents, drop-offs, cold water, and posted warnings, and keep everyone out of floodwater.
Never let anyone swim alone, at night, or in an unguarded area, even if they're a strong swimmer.$t$, null, $t$What is the water watcher's job?$t$, array[$t$To be the first to dive in during any emergency$t$, $t$To keep track of towels and belongings$t$, $t$To watch swimmers without distraction and hand off before stepping away$t$], 2, $t$A watcher with no other task spots trouble before it's too late.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 11, $t$Overnight stays$t$, $t$Hotels, cabins, and host churches all bring unfamiliar buildings and long nights.
On arrival:
- Walk the group through the nearest two exits from their rooms, and pick an outdoor meeting point in case of a fire alarm. Treat every alarm as real.
- Check that doors lock, smoke alarms are present, and windows and balconies are safe.
Room rules:
- Minors room with others of the same gender and similar age, and an adult never shares a bed with a minor who isn't their own child. Follow the sleeping arrangement rules from the Child Protection class.
- Leaders' rooms should be close to the rooms of the people they supervise.
- Set a curfew and do a room check at lights out, with two adults present when checking rooms of minors.
- Nobody leaves the lodging after curfew without a leader.
At a host church or gym, sleeping areas for different groups should be separated, with an adult awake or nearby through the night.$t$, null, $t$A fire alarm sounds at the hotel at 2 a.m. What should your group do?$t$, array[$t$Leave by the nearest exit and gather at the meeting point you picked on arrival$t$, $t$Go to the lobby and ask the front desk$t$, $t$Wait in the rooms to see if it's a false alarm$t$], 0, $t$Choosing exits and a meeting point on arrival makes a night alarm quick and orderly.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 12, $t$Emergencies away from home$t$, $t$When someone is hurt far from home, you won't have the church's AED or first aid station, so the trip has to bring its own readiness.
- Carry a stocked first aid kit, with bleeding control supplies, in every vehicle.
- At least one adult on the trip should be trained in CPR and first aid. Ask each venue where its nearest AED is.
- Keep the address of where you are handy. A 911 dispatcher needs a location, and in an unfamiliar place it's easy to forget. Use a phone's map or a nearby sign or mile marker.
If there's a crash or breakdown:
- Get the vehicle off the road if you can, turn on hazard lights, and set out reflective triangles.
- On a busy highway, passengers are usually safer staying buckled inside unless there's fire or smoke. If they must get out, exit away from traffic and wait well behind a guardrail.
- Call 911 if anyone is hurt or the vehicle is blocking traffic.
- Account for every passenger, then call the home contact.
Call parents of an injured minor as soon as the person is in care. Bring their medical consent form to the hospital.$t$, null, $t$Your van breaks down on a busy interstate with no smoke or fire. Where should passengers be?$t$, array[$t$Buckled inside, or if they must get out, away from traffic behind a guardrail$t$, $t$Walking to the next exit for help$t$, $t$Standing beside the van on the traffic side$t$], 0, $t$Passing traffic is the danger. Stay buckled unless there's fire, and keep clear of the lanes.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 13, $t$The home contact$t$, $t$Every trip needs a home contact: a church leader who isn't traveling and who can be reached day and night. They're the trip's lifeline.
The home contact holds:
- The full itinerary, including lodging addresses and phone numbers.
- The roster and copies of the forms.
- Each vehicle's description, license plate, and driver.
- The phone numbers of all trip leaders.
Agree on check-in times, such as at departure, at arrival, each evening, and when starting home. If a check-in is missed and the leader can't be reached, the home contact follows a plan to find out why.
The home contact also handles communication with families. If there's an emergency, the trip leader focuses on the scene and calls the home contact, who helps reach parents and church leadership. Families should know before departure who their contact is.
Agree that only the trip leader and the home contact share news about incidents. Ask travelers, especially teens, not to post about an emergency online until families have been reached.$t$, null, $t$Why should the home contact hold a copy of the itinerary and roster?$t$, array[$t$So the trip leader doesn't need to carry them$t$, $t$So they can plan the next trip$t$, $t$So someone who isn't traveling can track the group and reach families in an emergency$t$], 2, $t$The home contact is the link between the group and home, especially if something goes wrong.$t$),
  ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 14, $t$Coming home$t$, $t$The trip isn't over when the vehicle pulls into the church lot. Arrivals can be as chaotic as departures, with tired kids, waiting parents, and luggage everywhere.
- Call the home contact before you arrive with an estimated time, so parents aren't waiting in the dark for hours.
- Keep minors in the vehicle or in one supervised area until their parent or an authorized adult arrives. Release children only to the people listed on their forms, and sign them out.
- Two adults stay until the last child is picked up. No child is left waiting alone, and no adult waits alone with one child.
Within a few days, hold a short debrief with the trip leaders. What went well? What nearly went wrong? Write up any injuries, incidents, or near misses using the church's incident report, and share lessons with the next trip's leaders.
A good trip ends with everyone home safe and a plan that's a little better for next time.$t$, null, $t$The bus returns late, and one child's parent hasn't arrived. What should happen?$t$, array[$t$Two adults stay with the child until an authorized adult arrives and signs them out$t$, $t$Let the child walk home if it's nearby$t$, $t$Leave the child with the bus driver$t$], 0, $t$Children go home only with authorized adults, and two leaders stay until the last one leaves.$t$);

-- Class 12: Trips, Off-Site Events and Transportation (quiz)
delete from public.training_questions where class_id = 'e0e23b1a-e080-4b3e-98b1-406a29c3ada2';
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 1, $t$What is the purpose of a home contact on a church trip?$t$, array[$t$To drive the backup vehicle$t$, $t$To stay at home with the itinerary and roster, track check-ins, and help reach families$t$, $t$To approve the budget$t$, $t$To post updates on social media$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 2, $t$Who should keep a traveler's emergency inhaler or epinephrine?$t$, array[$t$The person who needs it, so it's always at hand$t$, $t$The bus driver$t$, $t$The home contact$t$, $t$The trip leader, locked in a bag$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 3, $t$What does the National Highway Traffic Safety Administration warn about fifteen-passenger vans?$t$, array[$t$They can't be driven on highways$t$, $t$They don't need seat belts in the rear rows$t$, $t$Their rollover risk rises as they're loaded, especially with underinflated tires$t$, $t$They're safest when fully loaded with cargo on the roof$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 4, $t$When should the group do a headcount?$t$, array[$t$Once a day at breakfast$t$, $t$Only when someone seems to be missing$t$, $t$Only at the start of the trip$t$, $t$At every transition, such as stops, venues, meals, and lights out$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 5, $t$How should a driver handle navigation and messages?$t$, array[$t$Let a passenger handle them while the vehicle is moving$t$, $t$Text only at red lights$t$, $t$Use the phone on speaker while driving$t$, $t$Ignore the route and follow the car ahead closely$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 6, $t$Why take a group photo each morning?$t$, array[$t$For the church newsletter$t$, $t$To check that everyone has matching shirts$t$, $t$So you have a picture of what everyone is wearing if someone goes missing$t$, $t$To prove attendance to parents$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 7, $t$A child can't be found at a stadium after a quick search. What comes next?$t$, array[$t$Send the other children to look$t$, $t$Wait at the bus$t$, $t$Alert venue security and call 911, then call the parents and the home contact$t$, $t$Keep searching quietly for an hour$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 8, $t$Who should be in a boat or kayak without a life jacket?$t$, array[$t$Strong swimmers$t$, $t$Adults only$t$, $t$Anyone in calm water$t$, $t$No one; everyone wears a fitted Coast Guard approved life jacket$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 9, $t$What should the group do on arrival at a hotel?$t$, array[$t$Prop open the room doors for leaders$t$, $t$Unpack and rest before anything else$t$, $t$Walk through the two nearest exits and pick an outdoor meeting point$t$, $t$Ask the front desk to take headcounts$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('e0e23b1a-e080-4b3e-98b1-406a29c3ada2', 10, $t$When the group returns, who can pick up a child?$t$, array[$t$An older sibling$t$, $t$Any adult the child knows$t$, $t$Whoever arrives first$t$, $t$Only the people listed on the child's forms, with a sign-out$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
update public.training_classes set minutes = 30 where id = 'e0e23b1a-e080-4b3e-98b1-406a29c3ada2';
