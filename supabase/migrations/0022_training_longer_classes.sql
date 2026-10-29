-- Longer classes (Matt, 2026-10-29): each starter class now runs about 28
-- to 30 minutes read aloud, with new material on every slide rather than
-- repeated points. Replaces the slides and quiz of the ten starter classes;
-- any changes made to those ten in the app are replaced too. They stay drafts.

-- Class 1
delete from public.training_progress where class_id = '8c2eb09f-f0fd-42cb-a381-c75f6042947e';
delete from public.training_lessons where class_id = '8c2eb09f-f0fd-42cb-a381-c75f6042947e';
delete from public.training_questions where class_id = '8c2eb09f-f0fd-42cb-a381-c75f6042947e';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 1, $t$Why a church needs a safety team$t$, $t$Churches are open places by design. Doors are unlocked, strangers are welcome, schedules are public, and people gather in one room at predictable times. That openness is part of our mission, and it is also why houses of worship need people who are paying attention.
Most of what a safety team handles is not violence. Across the country, the most common incidents at churches are medical emergencies, disruptive people, theft from cars and offices, child safety concerns, and severe weather. A trained team that is ready for those everyday events is also ready to act early when something more serious begins.
Scripture gives us a picture of this work. In Nehemiah 4, the people rebuilt the wall while others stood watch, and Ezekiel 33 describes the watchman whose job is to see trouble coming and sound the warning.
The short video below from the Cybersecurity and Infrastructure Security Agency introduces how houses of worship can protect their people while staying welcoming.$t$, $t$https://www.youtube.com/watch?v=Ku2peixQrjE$t$, $t$Which kind of incident does a church safety team handle most often?$t$, array[$t$A medical emergency or a disruptive person$t$, $t$A bomb threat$t$, $t$An armed attacker$t$], 0, $t$Violence gets the headlines, but medical calls, disruptions, theft and weather make up most of a team's work.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 2, $t$Our mission at MRBC$t$, $t$The safety team exists so that MRBC can worship, teach, and serve without fear. Every decision we make should support that mission.
That means two things are true at once. We want every guest to feel welcomed, and we want every threat to be noticed early. A team that feels like a checkpoint drives people away. A team that only smiles and never watches leaves people exposed. Our goal is to be the friendliest people in the building who also happen to notice everything.
The team's core cycle is observe, report, and respond.
- **Observe:** pay attention to people, places, and behavior on your post.
- **Report:** tell the right person quickly and clearly.
- **Respond:** take the action your role and training call for, and no more.
Most days, the cycle ends at observe. On some days it ends at report. Only rarely does it reach respond, and when it does, good observing and reporting are what make the response work.$t$, null, $t$Where does the observe, report, respond cycle end on most Sundays?$t$, array[$t$Observe$t$, $t$Respond$t$, $t$Report$t$], 0, $t$Most of the time, careful watching shows that everything is fine. That quiet work is still the job.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 3, $t$The three layers of security$t$, $t$The Cybersecurity and Infrastructure Security Agency recommends thinking about a campus as three layers, each one closer to the people we protect.
- **Outer layer:** the property line, driveways, and parking lots. This is where we first see vehicles and people arriving.
- **Middle layer:** the outside of the buildings and every entry door. This is where we decide which doors are open and who is watching them.
- **Inner layer:** the sanctuary, children's wing, offices, and the place where the offering is counted. These areas hold the people and things that need the most protection.
The value of layers is time. A concern noticed in the parking lot gives the team minutes to prepare. The same concern noticed at the sanctuary door gives the team seconds. Every layer we staff well pushes our first warning farther from the people inside.$t$, null, $t$A car pulls into the lot and the driver sits watching the main entrance. Which layer of security is this?$t$, array[$t$Middle$t$, $t$Inner$t$, $t$Outer$t$], 2, $t$The parking lot and drives are the outer layer, the first place we can notice something and buy time.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 4, $t$Roles on the team$t$, $t$Every member has a post, and every post has a purpose.
- **Team lead:** writes the service plan, assigns posts, keeps the radio net running, and makes the call when something needs to escalate.
- **Greeters and ushers:** the first friendly face at the door and the first set of eyes in the sanctuary. They welcome people and pass concerns to the team.
- **Exterior and parking:** walks the grounds, watches arrivals, and keeps an eye on vehicles during services.
- **Children's area:** protects check-in, hallways, classrooms, and pickup.
- **Medical responders:** carry the first aid kit and know where the automated external defibrillator is. They give care until emergency medical services arrive.
Roles overlap. A greeter may be the one who spots a medical problem, and a parking post may be the first to see a storm coming. Do your own post well, and know who to call for everything else.$t$, null, $t$Where should you be before the service starts?$t$, array[$t$Wherever is comfortable$t$, $t$At your assigned post, knowing your relief and who you report to$t$, $t$In the sanctuary with your family$t$], 1, $t$Knowing your post, your relief and your team lead before every service is what lets the team respond quickly.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 5, $t$Chain of command$t$, $t$In a fast-moving situation, a team without a clear leader becomes a group of well-meaning people pulling in different directions.
At MRBC, the team lead for that service directs the response. If the team lead is busy or unreachable, the assistant lead or the most senior member on duty takes over until the team lead is free. Pastoral staff are told what is happening, but the team lead makes the immediate safety decisions.
Following the chain of command does not mean waiting for permission when lives are at risk. Anyone can call 911. Anyone can pull a fire alarm for a fire. Anyone can move people away from danger. Once those urgent steps are taken, report to the team lead and follow their direction.
After an incident, the team lead decides what is shared with church leadership and what goes in the written report. Team members do not make announcements to the congregation, talk to the media, or post on social media about incidents.$t$, null, $t$Smoke is coming from a classroom and the team lead isn't answering the radio. What do you do?$t$, array[$t$Keep trying the radio until the team lead answers$t$, $t$Go find the pastor and ask what to do$t$, $t$Pull the fire alarm and start moving people out, then report to the team lead$t$], 2, $t$Life-safety steps like calling 911 or pulling an alarm never wait for permission. Report as soon as people are moving.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 6, $t$Your legal role$t$, $t$Safety team members are volunteers, not police officers. We do not have arrest powers, and the law treats us like any other private citizen acting on behalf of the property owner.
That shapes what we do. We can ask someone to leave church property on behalf of the church. If they refuse, we call law enforcement rather than physically removing them. We can watch, follow at a distance, and report. We avoid touching people unless someone is in immediate danger.
The church owes the people on its property reasonable care. Training, written policies, and clear records help show that we took that duty seriously. That is one reason this app keeps training records and incident reports.
Use of force is governed by state law and by MRBC's written policy. The general principle is that any force must be reasonable and proportionate to the threat, and it must stop when the threat stops. If you have questions about what you are allowed to do on your post, ask the team lead before Sunday, not during an incident.$t$, null, $t$A man refuses to leave after you ask him to on behalf of the church. What's the next step?$t$, array[$t$Let him stay, since you asked once$t$, $t$Step back, keep watching, and have the team lead call the police$t$, $t$Take his arm and walk him out$t$], 1, $t$Team members aren't police. When someone refuses to leave, law enforcement handles the removal.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 7, $t$Conduct on post$t$, $t$How we carry ourselves is part of security. A calm, attentive, friendly team member discourages trouble and reassures everyone else.
- Arrive at least thirty minutes before the service, check in with the team lead, and do a radio check.
- Walk your area before people arrive. Look for propped doors, unlocked rooms, hazards, and anything out of place.
- Keep your phone in your pocket unless you are using it for team business. Scrolling on post looks like nobody is watching, and it means nobody is.
- Keep conversations short. Greet people warmly, then return your attention to your area.
- Position yourself where you can see the most with the least movement, usually with your back to a wall and a view of doors.
- Dress to blend in with the congregation. Visible equipment should be limited to what MRBC's policy allows.
At the end of your shift, hand off to your relief in person. Tell them anything you noticed and anything still open.$t$, null, $t$You're on post at the side hallway and a friend stops to tell you about their vacation. What's the best approach?$t$, array[$t$Greet them warmly, keep it short, and keep your eyes on your area$t$, $t$Ignore them so you can stay focused$t$, $t$Give them your full attention, since relationships matter$t$], 0, $t$Friendliness and attention go together. A short, warm conversation keeps both the friendship and the post intact.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 8, $t$Discretion and confidentiality$t$, $t$Safety team members see things others don't. We know who had a medical emergency, which family is in a custody dispute, and which visitor was asked to leave. That knowledge is a trust.
Keep incident details within the team and church leadership. When a member of the congregation asks what happened, a kind and true answer is usually enough: "It was handled, and the family is being cared for."
Never post photos, videos, or descriptions of incidents on social media, even in a private group. Never discuss a person's medical condition with anyone who isn't involved in their care.
Discretion also protects the team. Details that spread can tip off a person of concern, create rumors, or show up later in a legal dispute.
If you have a concern about how an incident was handled, take it to the team lead or the pastor privately. Disagreement is welcome inside the team. It just doesn't belong in the church foyer.$t$, null, $t$An usher asks what happened during last week's medical call. What do you say?$t$, array[$t$Keep it to "it was handled" and let leadership share anything more$t$, $t$Tell them everything, since they're a church member$t$, $t$Post an update in the church group chat$t$], 0, $t$Discretion protects the people involved and the church. Incident details stay within the team.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 9, $t$Calling 911 early$t$, $t$One of the most common mistakes in church incidents is waiting too long to call for help. People hesitate because they don't want to cause a scene, they assume someone else already called, or they hope the problem will resolve itself.
At MRBC, the rule is simple: if you think you might need emergency services, call. Dispatchers would much rather cancel a response than arrive too late. A call can always be called off. Lost minutes can't be gotten back.
When you call, give the dispatcher the church's full street address first, then what is happening, how many people are involved, and where in the building. Tell them which entrance responders should use and that someone will meet them there. Then send a team member to that door.
Stay on the line if you can. Dispatchers can coach you through CPR, bleeding control, and other care while help is on the way.$t$, null, $t$What should you tell the 911 dispatcher first?$t$, array[$t$How the incident started$t$, $t$Your name and phone number$t$, $t$The church's full street address$t$], 2, $t$If the call drops, the address is what gets help moving. Give it first.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 10, $t$Readiness and training$t$, $t$A safety team is only as good as its last practice. Skills that aren't used fade quickly, especially under stress.
MRBC's team stays ready in several ways:
- **Classes in this app,** each with a certification that expires so we refresh it on schedule.
- **Hands-on training** in CPR, first aid, and bleeding control from certified instructors.
- **Drills,** such as fire evacuation, severe weather sheltering, and lockdown, so the congregation and the team have done it before they need to.
- **Tabletop exercises,** where the team talks through a scenario and finds gaps in the plan.
- **After-action reviews** following real incidents, focused on what to keep doing and what to change, not on blame.
Personal readiness matters too. Get enough rest before your shift, stay hydrated, and tell the team lead if you're not at your best on a given Sunday. A team member who is sick, exhausted, or distracted is better off swapping shifts than standing a post they can't fully watch.$t$, null, $t$You slept badly and feel foggy on a Sunday you're scheduled to serve. What should you do?$t$, array[$t$Tell the team lead so they can adjust posts or find relief$t$, $t$Stay home without telling anyone$t$, $t$Push through, since the team is counting on you$t$], 0, $t$Being honest about readiness lets the team lead cover your post well. Silence leaves a gap.$t$),
  ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 11, $t$Caring for each other$t$, $t$Safety work can be heavy. Team members may perform CPR on someone they know, comfort a frightened child, or face a hostile stranger. Those moments stay with people.
After a serious incident, the team lead will check in with everyone involved. Talk about what happened with the team, a pastor, or a counselor. Feeling shaken, having trouble sleeping, or replaying the event is normal. If it lasts more than a few weeks or gets in the way of daily life, ask for help.
Look out for your teammates too. Notice who seems withdrawn after a hard call, and reach out.
Finally, remember why we serve. We aren't here because we expect the worst. We're here because we love the people of this church and want them to be safe while they meet with God. That love should show in how we greet, how we watch, and how we respond.$t$, null, $t$A teammate has seemed withdrawn since helping during a cardiac arrest last month. What's a good step?$t$, array[$t$Check in with them and let the team lead or a pastor know they may need support$t$, $t$Leave them alone so they can process$t$, $t$Remove them from the team$t$], 0, $t$Hard calls affect people. Reaching out early is part of how the team takes care of its own.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 1, $t$What is the safety team's core cycle?$t$, array[$t$Search, secure, dismiss$t$, $t$Watch, wait, decide$t$, $t$Confront, remove, report$t$, $t$Observe, report, respond$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 2, $t$Which area is part of the inner layer of security?$t$, array[$t$The children's classrooms$t$, $t$The property line$t$, $t$The parking lot$t$, $t$The front sidewalk$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 3, $t$Why does security work in layers?$t$, array[$t$Insurance requires exactly three layers$t$, $t$It requires fewer volunteers$t$, $t$Each layer gives the team more time to notice and respond$t$, $t$It keeps visitors out of the building$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 4, $t$Who directs the response during an incident?$t$, array[$t$The person who called 911$t$, $t$The team lead on duty, or the next senior member if the lead is unavailable$t$, $t$The senior pastor$t$, $t$Whoever arrived first$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 5, $t$Which action can any team member take without waiting for permission?$t$, array[$t$Ban someone from the church$t$, $t$Call 911$t$, $t$Speak to the media$t$, $t$Announce an incident to the congregation$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 6, $t$What legal authority do safety team members have?$t$, array[$t$The same as police officers$t$, $t$None at all$t$, $t$Authority to arrest anyone on church property$t$, $t$The same as any private citizen acting for the church$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 7, $t$How early should you arrive for your shift?$t$, array[$t$Ten minutes before$t$, $t$Right when the service starts$t$, $t$Whenever is convenient$t$, $t$At least thirty minutes before$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 8, $t$Where should incident details be shared?$t$, array[$t$Only within the team and church leadership$t$, $t$In the church group chat$t$, $t$On social media, without names$t$, $t$With anyone who asks$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 9, $t$Why is it important to call 911 early?$t$, array[$t$A response can be canceled, but lost time can't be recovered$t$, $t$Dispatchers get upset by late calls$t$, $t$It's required before helping anyone$t$, $t$So someone else doesn't have to$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8c2eb09f-f0fd-42cb-a381-c75f6042947e', 10, $t$What is the purpose of an after-action review?$t$, array[$t$To decide who leaves the team$t$, $t$To prepare a statement for the media$t$, $t$To learn what to keep doing and what to change$t$, $t$To find someone to blame$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
update public.training_classes set minutes = 28 where id = '8c2eb09f-f0fd-42cb-a381-c75f6042947e';

-- Class 2
delete from public.training_progress where class_id = '76677062-f884-4ee6-be6b-08c76b85bd75';
delete from public.training_lessons where class_id = '76677062-f884-4ee6-be6b-08c76b85bd75';
delete from public.training_questions where class_id = '76677062-f884-4ee6-be6b-08c76b85bd75';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 1, $t$What situational awareness means$t$, $t$Situational awareness is knowing what is going on around you, understanding what it means, and thinking ahead to what might happen next. It is the skill underneath almost everything else the safety team does.
It is not paranoia. A team member with good awareness is relaxed, friendly, and present. They aren't expecting trouble from every visitor. They simply notice more, and they notice sooner.
Researchers describe awareness in three levels:
- **Perception:** you see and hear what is happening, such as a man walking quickly toward the children's wing.
- **Comprehension:** you understand what it means. He isn't wearing a visitor tag, and services in that wing don't start for twenty minutes.
- **Projection:** you think ahead. If he keeps going, he will reach the classrooms before anyone checks him.
Most people stop at the first level, if they get there at all. Training moves you through all three quickly, so that you have time to act while a situation is still small.
Awareness is also a team skill. What you see matters most when it reaches the person who needs to know.$t$, null, $t$You notice a man walking quickly toward the children's wing without a visitor tag. Thinking "he'll reach the classrooms before anyone checks him" is which level of awareness?$t$, array[$t$Projection$t$, $t$Comprehension$t$, $t$Perception$t$], 0, $t$Projection is thinking ahead to what will happen next. It's what gives you time to act.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 2, $t$The color code of alertness$t$, $t$Many safety teams use a color code, adapted from Jeff Cooper's work, to describe levels of alertness.
- **White:** unaware and switched off. Looking at a phone, lost in thought. Nobody on post should be in white.
- **Yellow:** relaxed but alert. You are scanning your area and noticing people, without any particular concern. This is where a team member should spend most of a service.
- **Orange:** focused. Something specific has caught your attention, and you are watching it while you decide whether it matters. You also tell the team.
- **Red:** action. The situation calls for a response, and you are carrying out the plan.
The most important step is from white to yellow, because you can't move to orange if you never saw anything.
Moving to orange is not an accusation. Plenty of things that earn a closer look turn out to be harmless. Return to yellow once a concern is resolved, and tell the team it's resolved too, so nobody keeps tracking something that's over.$t$, null, $t$You notice someone staring at the children's wing doors. What level of alertness do you move to?$t$, array[$t$Stay relaxed in yellow. It's probably nothing$t$, $t$Red, and confront them now$t$, $t$Orange, and tell your team$t$], 2, $t$Moving to orange early and telling the team buys time without overreacting.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 3, $t$Learning the baseline$t$, $t$You can't spot what's unusual until you know what's normal. That normal is called the baseline.
Every church has a rhythm. At MRBC on a Sunday, families arrive in a wave about fifteen minutes before the service. Children go to check-in first. Regulars head to the same seats. The lobby is loud and happy before worship and quiet during the sermon. Certain doors are used and others never are.
The baseline changes with the event. A funeral is quiet, emotional, and full of visitors. A youth event is loud and crowded with teenagers. A Christmas Eve service brings many people who rarely attend. Before each event, ask yourself what normal will look like today.
Learn the baseline for your own post. Notice the usual cars in the lot, the volunteers who come and go, and the delivery that arrives every week. The better you know your area, the faster something out of place will catch your eye.
Spend your first minutes on post just watching. You are tuning your eyes to today's normal, so that anything off pattern stands out.$t$, null, $t$Why does the baseline at a funeral differ from a regular Sunday service?$t$, array[$t$Funerals don't need a safety team$t$, $t$It doesn't. Normal is always the same$t$, $t$Different events bring different crowds, moods, and movement$t$], 2, $t$Each event has its own normal. Know what to expect before you start watching for what's unusual.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 4, $t$Anomalies and clusters$t$, $t$An anomaly is something that breaks the baseline. It could be something present that shouldn't be, like a person in a staff-only area. Or it could be something absent that should be there, like silence where there's usually noise.
A single anomaly rarely means danger. People arrive late, wear odd clothing, or get lost looking for the restroom. What deserves attention is a cluster of anomalies, several unusual details that add up.
For example, a man in a heavy coat on a hot day is unusual. A man in a heavy coat on a hot day who keeps one hand pressed against his side, avoids eye contact, and walks the hallway twice without going anywhere is a cluster.
A common guide is the rule of three. When you notice three anomalies around the same person or situation, move to orange, tell your team, and keep watching.
Clusters also apply to places. A side door found unlocked, a car parked in an odd spot, and a stranger near the back of the building may each be innocent. Together, they are worth a closer look.$t$, null, $t$Which of these is the best example of an anomaly worth a second look?$t$, array[$t$Someone sitting in the back row$t$, $t$A family arriving late with three kids$t$, $t$A man in a heavy coat on a hot day who keeps walking the hallway$t$], 2, $t$Lots of things are unusual but harmless. Clothing that doesn't fit the weather plus repeated wandering is a cluster worth watching.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 5, $t$Behavior, not appearance$t$, $t$What makes someone a concern is what they do, not who they are. Race, age, clothing style, disability, poverty, and mental illness are not threat indicators.
Focusing on appearance causes two problems. It treats innocent people as suspects, which goes against everything a church stands for. And it causes us to miss real threats, because people who intend harm often look ordinary and may even be members.
Instead, look for behaviors that don't fit the setting:
- Moving against the flow of the crowd, or lingering where people don't normally stop.
- Paying more attention to the safety team, cameras, or exits than to the service.
- Emotional intensity that doesn't match the moment, such as rage during a quiet prayer.
- Repeated trips to the same door, hallway, or vehicle.
- Avoiding greeters, or giving answers that don't add up.
When you report a concern, describe the behavior. "He walked the east hallway twice and tried the nursery door" gives the team something to act on. "He looked shady" doesn't, and it can sound like bias.$t$, null, $t$Which description gives the team the most useful information?$t$, array[$t$"She looks like she doesn't belong here."$t$, $t$"She's been standing by the side exit for ten minutes watching the ushers."$t$, $t$"She's dressed strangely."$t$], 1, $t$Describe behavior. It's fair, specific, and tells teammates exactly what to watch.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 6, $t$Watching hands$t$, $t$Hands are what can hold a weapon or cause harm, so they are the first thing to watch when someone draws your attention.
Notice whether you can see both hands. Hands hidden in pockets, behind the back, or inside a jacket aren't proof of anything, but they're worth noticing when they come with other concerns.
People carrying a concealed weapon often give small, unconscious signs:
- Repeatedly touching or adjusting one spot on the waistband, ankle, or jacket, which is called a security check.
- Walking with one arm held still against the body while the other swings normally.
- Wearing a jacket that hangs unevenly because one side is heavier.
- Turning one side of the body away from others, especially when approached.
- A bulge or outline under clothing that keeps getting adjusted.
Many law-abiding people carry legally, so these signs alone do not mean someone is a threat. Combine them with behavior. A person repeatedly checking a weapon while showing anger, fixating on someone, or ignoring the service is a strong reason to move to orange and quietly inform the team lead.$t$, null, $t$Which detail matters most to watch?$t$, array[$t$Their shoes$t$, $t$Their phone$t$, $t$Their hands$t$], 2, $t$Hands are what can hold a weapon or cause harm. Watch them first.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 7, $t$The pathway to violence$t$, $t$Attacks at houses of worship rarely come out of nowhere. Researchers with the Secret Service and the FBI describe a pathway that most attackers move along over days, weeks, or months.
- **Grievance:** a deep sense of being wronged, often by a person, group, or the church itself.
- **Ideation:** thinking about violence as the answer, and often talking about it.
- **Research and planning:** learning about the target, its schedule, and its people.
- **Preparation:** getting weapons, equipment, or a way in.
- **Probing:** visiting or testing the target to see how it responds.
- **Attack.**
The good news is that people on this path often leak their intentions. They make threats, post angry messages, tell friends, or show sudden interest in weapons and past attacks. Family members, coworkers, and fellow church members often notice before anyone else.
That's why reports matter even when nothing seems urgent. A concerning post, an odd comment, or a former member's sudden return may be one piece of a larger picture. Take it to the team lead, who can bring in church leadership or law enforcement.$t$, null, $t$A former member who left angry posts a message saying the church "will pay." What should happen?$t$, array[$t$A team member should call him to talk it out$t$, $t$Nothing, since he no longer attends$t$, $t$Report it to the team lead right away so leadership and law enforcement can assess it$t$], 2, $t$A grievance plus a threatening statement is a warning sign on the pathway to violence. Report it promptly.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 8, $t$Surveillance and probing$t$, $t$Before an attack or a theft, people often study their target. Noticing this early is one of the best chances the team has to stop something before it begins.
Signs of surveillance and probing include:
- Photographing or filming entrances, exits, cameras, or the safety team rather than people or the building's architecture.
- Asking unusual questions, such as when the offering is counted, how many security people there are, or which doors are locked during services.
- Testing doors, gates, or alarms, then leaving when noticed.
- Sitting in a parked car for long periods with a view of the building.
- Showing up repeatedly without taking part in anything.
A friendly greeting is one of the best tools here. Walking up and saying, "Good morning, can I help you find something?" lets the person know they have been noticed, and it gives you a chance to see how they respond. Most people are glad for the help. Someone who is probing usually becomes uncomfortable and leaves.
Write down descriptions, vehicle details, and times, and report them. Patterns across several weeks matter.$t$, null, $t$A visitor asks a greeter what time the offering is counted and where. How should that be handled?$t$, array[$t$Answer politely, since he asked nicely$t$, $t$Give a general answer, note his description, and tell the team lead$t$, $t$Ask him to leave immediately$t$], 1, $t$Questions about money handling or security aren't normal visitor questions. Don't share details, and report it.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 9, $t$Persons of concern$t$, $t$Sometimes the team knows in advance about someone who could pose a risk. These are called persons of concern.
They may include:
- Someone named in a protective order held by a member, often in a domestic violence situation.
- A parent in a custody dispute who isn't allowed to pick up a child.
- A former member or employee who left in conflict.
- Someone who has made threats in person, by phone, or online.
- A person who has been given a trespass warning by the church.
Church leadership should share what the team needs to know: a description, a photo if available, the vehicle, and what to do if the person appears. Keep this information private and limited to the team.
If a person of concern arrives, don't confront them alone. Report their location on the radio, keep them in sight from a safe distance, and let the team lead direct the response. Protect the person they may be targeting by quietly moving that person to a safe place if needed.$t$, null, $t$You recognize a man named in a member's protective order walking into the lobby. What do you do first?$t$, array[$t$Find the member and tell them to leave$t$, $t$Walk over and tell him he isn't allowed here$t$, $t$Radio the team lead with his location and keep watching from a distance$t$], 2, $t$Report and observe first. The team lead coordinates protecting the member and calling police.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 10, $t$Positioning and scanning$t$, $t$Where you stand determines what you can see. Good positioning lets you watch more with less movement and gives you time to react.
- Stand with a wall or a solid object behind you, so nobody can come up unseen.
- Choose a spot that lets you see doors, hallways, and the crowd at the same time.
- Avoid standing in the middle of traffic, where people block your view.
- Stay close enough to your area to reach it quickly, but far enough to see the whole thing.
Scan in a pattern rather than letting your eyes drift. Look near, then far. Look left, center, and right. Check entrances on a regular rhythm. Notice who comes in and whether they leave.
Avoid fixating on one person for too long. If something has your attention, tell a teammate so they can keep watching the rest of the area. Two people sharing the load is much safer than one person with tunnel vision.
During the sermon, it's easy to drift into listening. Enjoy the message, but keep your eyes on your area.$t$, null, $t$You're watching a man who caught your attention near the side door. What helps you avoid missing something elsewhere?$t$, array[$t$Keep your eyes locked on him until he leaves$t$, $t$Stop watching him to focus on your area$t$, $t$Tell a teammate so they can share the watch while you keep scanning$t$], 2, $t$Sharing the watch prevents tunnel vision, so one concern doesn't blind you to everything else.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 11, $t$How stress changes what you notice$t$, $t$When something frightening happens, the body releases adrenaline. Your heart rate jumps, and your senses change in ways you need to expect.
- **Tunnel vision:** your field of view narrows to the threat. You may not see a second person or an exit right beside you.
- **Auditory exclusion:** you may stop hearing the radio, alarms, or people shouting your name.
- **Loss of fine motor skills:** fumbling with keys, a radio button, or a phone becomes common.
- **Time distortion:** events may seem to slow down or speed up, and memories may come back out of order.
You can't stop these reactions, but you can reduce them. Take slow, deep breaths: in for four seconds, hold for four, out for four, and hold for four. This is called box breathing, and it lowers your heart rate. Make yourself turn your head and look around, which breaks tunnel vision.
Training helps too. Actions you have rehearsed are easier to do under stress, which is why drills matter.
After an incident, write your notes as soon as you can, before memory starts to change.$t$, null, $t$During a tense situation, you realize you can only see the person in front of you. What helps?$t$, array[$t$Close your eyes for a moment$t$, $t$Move closer to the person$t$, $t$Take a slow breath and deliberately turn your head to scan around you$t$], 2, $t$Breathing and deliberately scanning break tunnel vision, so you can see exits, teammates, and other threats.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 12, $t$The moments that are easy to miss$t$, $t$Teams tend to be most alert during the main service and least alert at the edges of it. Those edges are often the most vulnerable times.
- **Arrival and dismissal:** crowds, open doors, and children moving between rooms make it hard to track people. Be at full attention during the first and last fifteen minutes.
- **After the service:** teams relax, doors stay open, and the building empties slowly. Stay on post until the team lead releases you.
- **Weekday events:** Bible studies, choir practice, and office hours often have no team at all. A few people in a large building, with unlocked doors, are easy targets for theft or worse.
- **Night meetings:** dark parking lots and walking to cars alone deserve a plan. Offer to walk people out, and park near lights.
- **Special events:** funerals, weddings, and holiday services bring large crowds of unfamiliar faces and change the baseline.
Encourage staff and ministry leaders to keep a basic level of awareness when the team isn't present. Simple habits help: lock doors that aren't in use, know who is in the building, and keep a phone nearby. The team can share these habits with the leaders of weekday groups.$t$, null, $t$When is a church often most vulnerable?$t$, array[$t$Only late at night$t$, $t$At arrival, dismissal, and weekday events, when attention and staffing drop$t$, $t$During the sermon, when everyone is seated$t$], 1, $t$Attention tends to slip at the edges of a service and on weekdays. Those are the times to stay sharp.$t$),
  ('76677062-f884-4ee6-be6b-08c76b85bd75', 13, $t$Reporting what you see$t$, $t$Awareness only protects people when it turns into a clear report. A good radio report is short, specific, and gives teammates what they need to find and track the concern.
Use this order:
- **Who you're calling, and who you are:** "Team Lead, Lobby."
- **Description:** sex, approximate age, clothing from top to bottom, and anything distinctive.
- **Location:** the specific place, using the building names the team agreed on.
- **Behavior:** what they are doing that drew your attention.
- **Direction:** where they're heading, if they're moving.
For example: "Team Lead, Lobby. Male, about forty, gray hoodie, jeans, red backpack. East hallway near the nursery. Tried the door twice. Now heading toward the gym."
Avoid opinions and guesses, such as "he looks drunk" or "she's up to something." Stick to what you see.
Update the team when anything changes, including when the person leaves or the concern turns out to be nothing. A report that ends with "all clear" is just as valuable as one that starts a response.$t$, null, $t$Which report helps the team the most?$t$, array[$t$"Some guy looks sketchy."$t$, $t$"I've got a bad feeling."$t$, $t$"Male, blue jacket, east hallway, tried the nursery door twice, heading to the lobby."$t$], 2, $t$A good report gives description, location, behavior and direction, so teammates know exactly who and where.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 1, $t$What is a baseline?$t$, array[$t$The minimum number of team members on duty$t$, $t$The first row of the sanctuary$t$, $t$What normal looks like in a place at a given time$t$, $t$A list of known troublemakers$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 2, $t$Which alertness color should a team member be in for most of a service?$t$, array[$t$Yellow$t$, $t$Red$t$, $t$White$t$, $t$Orange$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 3, $t$What should make you move from yellow to orange?$t$, array[$t$The service starts$t$, $t$A child starts crying$t$, $t$Something specific catches your attention and deserves a closer look$t$, $t$You see someone you don't recognize$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 4, $t$According to the rule of three, when should you move to a higher alert?$t$, array[$t$After seeing any single unusual detail$t$, $t$After three people complain$t$, $t$Only when you see a weapon$t$, $t$When several anomalies add up around the same person or situation$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 5, $t$Which of these is a behavior worth noticing, rather than an appearance?$t$, array[$t$Wearing old clothes$t$, $t$Being a stranger$t$, $t$Having tattoos$t$, $t$Repeatedly touching the same spot on the waistband$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 6, $t$Which is a common step on the pathway to violence before an attack?$t$, array[$t$Joining a small group$t$, $t$Asking for prayer$t$, $t$Giving to the offering$t$, $t$Probing the target to see how it responds$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 7, $t$What is a good first response to someone who seems to be studying the building?$t$, array[$t$Ignore them$t$, $t$Photograph them without saying anything$t$, $t$Greet them and offer help, then report what you saw$t$, $t$Call the police right away$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 8, $t$What should you avoid doing if a known person of concern arrives?$t$, array[$t$Confronting them alone$t$, $t$Reporting their location$t$, $t$Letting the team lead direct the response$t$, $t$Keeping them in sight$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 9, $t$What is box breathing used for?$t$, array[$t$Staying warm on outdoor posts$t$, $t$Counting people in a room$t$, $t$Speaking clearly on the radio$t$, $t$Lowering your heart rate during stress$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('76677062-f884-4ee6-be6b-08c76b85bd75', 10, $t$What should you do when a concern you reported turns out to be nothing?$t$, array[$t$Keep watching the person anyway$t$, $t$Say nothing more$t$, $t$Tell the team it's resolved$t$, $t$File a formal complaint$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
update public.training_classes set minutes = 29 where id = '76677062-f884-4ee6-be6b-08c76b85bd75';

-- Class 3
delete from public.training_progress where class_id = '717958c1-24fc-4f3d-9fde-e56c60517b83';
delete from public.training_lessons where class_id = '717958c1-24fc-4f3d-9fde-e56c60517b83';
delete from public.training_questions where class_id = '717958c1-24fc-4f3d-9fde-e56c60517b83';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', 1, $t$Assess, de-escalate, report$t$, $t$Most conflicts at church start small: an argument over a parking spot, a parent upset about a classroom, a visitor who is angry at the world. Handled well, they end quietly. Handled poorly, they can grow into something dangerous.
The Cybersecurity and Infrastructure Security Agency teaches a simple sequence for these moments.
- **Assess:** before you step in, decide whether anyone is in immediate danger. If a weapon is shown or someone is being hurt, it is an emergency. Get people away and call 911.
- **De-escalate:** if there's no immediate danger, use calm words, body language, and choices to lower the temperature.
- **Report:** tell the team lead, and document what happened afterward.
Assessing also means checking yourself. If you're angry or rattled, let a calmer teammate take the lead.
The video below is CISA's full de-escalation training. It runs about thirteen minutes and shows these steps in realistic scenes.$t$, $t$https://www.youtube.com/watch?v=UBNsWC_b5Yo$t$, $t$A visitor is shouting at a greeter about a parking spot. Before you step in, what's the first thing to ask yourself?$t$, array[$t$Is anyone in immediate danger?$t$, $t$Who is right about the parking spot?$t$, $t$Should I ask them to leave?$t$], 0, $t$Assess first. If someone is in immediate danger, it's an emergency, so call 911. If not, de-escalate.$t$),
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', 2, $t$Approaching safely$t$, $t$How you approach a person sends a message before you say a word.
- Approach from the front and slightly to the side, so you don't surprise them.
- Stop at about two arm's lengths away. That distance feels respectful and gives you time to react.
- Stand at an angle, not square to them. It looks less confrontational and protects you.
- Keep your hands open and visible, at about waist height. Avoid crossing your arms, pointing, or putting your hands on your hips.
- Keep an exit behind you, and don't trap the person in a corner either.
One person should do the talking. Others can stay nearby as backup, but several voices at once feel like a crowd closing in.
Whenever you can, move the conversation away from an audience. People who feel watched often escalate to save face. "Let's step over here where it's quieter" gives everyone room.$t$, null, $t$Where do you stand when you approach them?$t$, array[$t$Behind them so they can't see you coming$t$, $t$Right in front of them, close enough to block them$t$, $t$At an angle, about two arm's lengths away, hands open and visible$t$], 2, $t$Standing at an angle with open hands feels less threatening and keeps you safe.$t$),
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', 3, $t$Words that lower the temperature$t$, $t$Upset people want to be heard before they can listen. Your first goal is to show them they've been understood.
- Use a calm, low, slow voice. People tend to match the tone they hear.
- Introduce yourself by first name and ask theirs.
- Listen without interrupting. Let them vent.
- Reflect what you hear: "So you've been waiting twenty minutes and nobody has helped you."
- Acknowledge the feeling without agreeing with the behavior: "I can see you're frustrated."
- Offer choices, so they keep a sense of control: "We can talk here or step out to the lobby. Which would you prefer?"
Avoid phrases that tend to make things worse, such as "calm down," "you need to," "that's the rule," or "I can't help you." Don't argue facts, make threats, or promise things you can't deliver.
Silence is a tool too. A pause after someone vents often lets them hear themselves and settle.$t$, null, $t$Which response is most likely to calm them down?$t$, array[$t$"Calm down, sir."$t$, $t$"I can see you're frustrated. Let's step out to the lobby and sort this out."$t$, $t$"You need to leave now."$t$], 1, $t$Acknowledge the feeling and offer a choice. "Calm down" usually makes things worse.$t$),
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', 4, $t$Situations we see at church$t$, $t$Different situations call for slightly different approaches.
- **Grief or family conflict:** people at funerals or in family disputes may lash out from pain. Bring in a pastor early.
- **Mental health crisis:** speak simply and slowly, reduce noise and crowds, and don't argue with what they believe they're seeing or hearing. If they may harm themselves, call 988 or 911.
- **Intoxication:** don't reason or argue. Keep things simple, keep distance, and arrange a safe ride. Never let them drive.
- **Someone asking for money:** be kind, and follow MRBC's benevolence process instead of handing out cash. Have them wait in a public area.
- **Protesters:** stay polite, don't engage in debate, and keep them away from entrances and children. Let the team lead decide whether police are needed.
In every case, treat the person with dignity. They are someone God loves, even on their worst day. That attitude shows in your voice and face.$t$, null, $t$A man appears intoxicated and wants to drive home after the service. What's the best approach?$t$, array[$t$Take his keys by force$t$, $t$Let him go, since it's his decision$t$, $t$Speak simply, keep him talking calmly, and help arrange a safe ride, calling police if he insists on driving$t$], 2, $t$Don't argue with an intoxicated person, but don't let them drive either. A safe ride or police protects everyone.$t$),
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', 5, $t$When talking isn't working$t$, $t$De-escalation works most of the time, but not always. Know the signs that a situation is getting worse:
- Closing the distance, or stepping toward you after you step back.
- Clenched fists, a bladed stance, or pacing.
- A sudden shift from shouting to quiet, focused staring.
- Reaching into a pocket, bag, or jacket.
- Direct threats against you or someone else.
When you see these signs, your goal shifts from calming them to staying safe. Step back and keep your hands up and open. Put an object such as a table or a row of chairs between you. Radio the team lead with a clear description, and call 911.
Move other people away, especially children. Don't try to be a hero or take someone down by yourself. Physical intervention is a last resort, only when someone is about to be hurt, and only as allowed by MRBC policy and your training.$t$, null, $t$The person gets closer and reaches into their jacket while yelling threats. What now?$t$, array[$t$Keep talking in a calm voice$t$, $t$Step back, create distance, radio the team lead, and call 911$t$, $t$Grab their arm$t$], 1, $t$Threats, closing distance and reaching for something mean talking isn't working. Get distance and get help.$t$),
  ('717958c1-24fc-4f3d-9fde-e56c60517b83', 6, $t$After the conflict$t$, $t$When things are calm, the work isn't quite finished.
Check on everyone involved. The greeter who was yelled at may be shaken. The upset person may need a pastor's follow-up. Thank the teammates who helped.
Report to the team lead, then file an incident report in the app the same day. Include who was involved, what was said, what you did, and how it ended. Quote key statements exactly.
If the person was asked to leave, note whether the church may need to issue a formal trespass warning, and include their description and vehicle.
Finally, think about what you learned. Was there an earlier moment when someone could have stepped in? Did the team communicate well? Those lessons belong in the next team meeting.$t$, null, $t$The argument is over and everyone has calmed down. What's left to do?$t$, array[$t$Post about it in the team group chat$t$, $t$Check on the people involved and file an incident report the same day$t$, $t$Nothing, since it ended well$t$], 1, $t$Following up and documenting help the people involved and give the team a record to learn from.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 1, $t$What are CISA's three steps for handling a tense situation?$t$, array[$t$Observe, confront, remove$t$, $t$Warn, detain, call$t$, $t$Assess, de-escalate, report$t$, $t$Listen, argue, decide$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 2, $t$What should you do if a weapon is shown during an argument?$t$, array[$t$Keep de-escalating$t$, $t$Treat it as an emergency, get people away, and call 911$t$, $t$Try to take it$t$, $t$Ask them to put it away$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 3, $t$About how far away should you stop when approaching an upset person?$t$, array[$t$It doesn't matter$t$, $t$About two arm's lengths$t$, $t$Close enough to touch them$t$, $t$Across the room$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 4, $t$Why should only one person do the talking?$t$, array[$t$It's faster$t$, $t$It's required by law$t$, $t$Other team members aren't trained$t$, $t$Several voices at once can feel like a crowd closing in$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 5, $t$Which phrase is most likely to make an upset person angrier?$t$, array[$t$"Tell me what happened."$t$, $t$"Calm down."$t$, $t$"Would you like to step outside to talk?"$t$, $t$"I can see why you're frustrated."$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 6, $t$Why is offering choices helpful?$t$, array[$t$It gives the person a sense of control$t$, $t$It makes the conversation longer$t$, $t$It tests whether they are telling the truth$t$, $t$It's required by church policy$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 7, $t$What's the best way to help someone in a mental health crisis?$t$, array[$t$Speak simply and slowly and reduce noise and crowds$t$, $t$Leave them alone$t$, $t$Correct what they believe they're seeing$t$, $t$Raise your voice so they focus$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 8, $t$Which sign shows a situation is getting worse?$t$, array[$t$They lower their voice and apologize$t$, $t$They step toward you after you step back$t$, $t$They sit down$t$, $t$They start to cry$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 9, $t$When is physical intervention appropriate?$t$, array[$t$Never, under any circumstances$t$, $t$Whenever someone refuses to leave$t$, $t$Only as a last resort when someone is about to be hurt, within policy and training$t$, $t$When someone is shouting$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('717958c1-24fc-4f3d-9fde-e56c60517b83', 10, $t$Why move a tense conversation away from an audience?$t$, array[$t$So the service isn't interrupted$t$, $t$It's required by church policy$t$, $t$People who feel watched often escalate to save face$t$, $t$So nobody can witness it$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
update public.training_classes set minutes = 29 where id = '717958c1-24fc-4f3d-9fde-e56c60517b83';

-- Class 4
delete from public.training_progress where class_id = '7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51';
delete from public.training_lessons where class_id = '7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51';
delete from public.training_questions where class_id = '7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 1, $t$Why we plan for the worst$t$, $t$Active attacks at houses of worship are rare, but they are deadly when they happen, and most are over within minutes. Federal studies of active shooter incidents show that many end before police arrive, often in less than five minutes. What people do in those first moments decides how many survive.
A plan doesn't make a church fearful. It makes people calmer, because they already know what to do. The national guidance from the Department of Homeland Security and the FBI is Run, Hide, Fight. Some trainers use the words Avoid, Deny, Defend for the same ideas.
The core principle is to get as far from the threat as possible, as fast as possible. If you can't get away, keep the attacker away from you. Fight only as a last resort.
The video below shows how Run, Hide, Fight works.
The video below is a dramatization of an active shooter event and may be upsetting.$t$, $t$https://www.youtube.com/watch?v=8rDdY4EaKVY$t$, $t$During the sermon you hear gunshots from the lobby. The side exit near you is clear. What do you do?$t$, array[$t$Get people out the side exit, away from the threat$t$, $t$Go to the lobby to see what's happening$t$, $t$Tell everyone to hide under the pews$t$], 0, $t$If there's a safe way out, run is the first option. Get away from the threat.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 2, $t$Overcoming denial$t$, $t$When something terrible begins, most people's first reaction is to explain it away. Gunshots sound like fireworks, a dropped hymnal, or a car backfiring. People look around to see how others are reacting, and when nobody moves, they stay seated. Survivors of attacks often describe losing precious seconds this way.
Others freeze completely. Freezing is a normal stress response, not a character flaw, and it can be overcome with a plan.
- **Trust the signs.** Loud bangs followed by screaming, people running, or the smell of gunpowder mean act now. It's far better to move and be wrong than to wait and be right.
- **Have a plan before you need it.** When you sit down anywhere, notice the nearest two exits. That small habit gives your brain an answer ready to go.
- **Give yourself a command.** Saying "Move" or "Get out" out loud can break a freeze.
- **Lead others.** People in shock respond to a firm, clear voice. Telling them where to go helps them and helps you act.
For team members, practicing the response in drills is what turns a plan into action under stress.$t$, null, $t$You hear several loud bangs from the lobby, then screaming. People around you are looking at each other. What do you do?$t$, array[$t$Go look to be sure it's gunfire$t$, $t$Wait to see how others react$t$, $t$Treat it as an attack and start moving people away from the sound$t$], 2, $t$Denial costs seconds. Act on the signs and lead others. It's better to move and be wrong.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 3, $t$Run$t$, $t$Running is the best option whenever there is a safe way out.
- Know at least two exits from every room you spend time in at church, including windows on the ground floor.
- Move away from the sound of gunfire. Don't go toward it to see what's happening.
- Leave belongings behind. Purses, Bibles, and bags slow you down.
- Help others escape if you can, but don't let someone's refusal to leave keep you there.
- Keep your hands visible and empty as you leave, so arriving police don't mistake you for a threat.
- Once you're out, keep going. Get behind something solid, like a building or a car's engine block, and keep moving away.
- Warn others not to enter the area, and call 911 when you're safe.
For the congregation, running means people may scatter in every direction. That's acceptable. Distance and cover matter more than staying together. Reunification comes later.$t$, null, $t$You've gotten out a side door. What's your next move?$t$, array[$t$Go back in to get your bag$t$, $t$Keep moving away and get behind something solid, then call 911$t$, $t$Wait by the door for others$t$], 1, $t$Keep distance between you and the threat. Once you're safe, call 911 and warn others away.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 4, $t$Hide$t$, $t$If running isn't possible, hide in a place that keeps the attacker out.
- Choose a room with a door that locks, or a solid door that opens inward so it can be blocked.
- Lock the door and barricade it with heavy furniture. Wedge it if you can.
- Turn off the lights, close blinds, and silence phones, including vibration.
- Stay out of sight of the door's window, and spread out so you aren't all in one group.
- Stay quiet and still. Don't open the door for anyone who says they're police unless you're sure. Real officers will open it themselves or confirm another way.
- If you can't speak, leave the line open so the dispatcher can listen, or text 911 where it's available. Give your location in the building.
Hiding under a pew in the sanctuary is concealment, not protection. Pews don't stop bullets, and attackers look under them. Hide only in a room that can be locked or barricaded, and use the time to prepare to fight if the door is breached.$t$, null, $t$Why isn't hiding under the pews a good plan?$t$, array[$t$Pews don't stop bullets or keep the attacker away$t$, $t$It's against church rules$t$, $t$It's uncomfortable$t$], 0, $t$A real hiding place puts a locked or barricaded door between you and the attacker.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 5, $t$Fight$t$, $t$Fighting is the last resort, when your life is in immediate danger and you can't run or hide.
If it comes to that, commit fully:
- Act with as much physical aggression as you can. Half measures don't work.
- Use whatever is at hand: chairs, fire extinguishers, hymnals, coffee pots, anything heavy or hard that can be thrown or swung.
- Work as a group if you can. Several people attacking at once can overwhelm one person.
- Go for the weapon and the arms, and keep control until police arrive.
- Throw things at the attacker's face to distract them as they enter.
For the safety team, MRBC's written policy decides whether any team members are armed and what they may do. Members who aren't authorized should focus on getting people out, locking down rooms, and calling 911. Never stage weapons, take on armed roles, or improvise plans that the church hasn't approved.$t$, null, $t$Which of these describes the right mindset if you have no choice but to fight?$t$, array[$t$Commit fully, use anything at hand, and work together with others$t$, $t$Fight back a little and see what happens$t$, $t$Try to talk the attacker down$t$], 0, $t$Fighting is a last resort, and when it comes, full commitment and teamwork give the best chance of survival.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 6, $t$The team's first minute$t$, $t$In the first minute, the team's job is to buy time for everyone else.
- **Sound the alarm:** use the agreed code phrase on the radio, and announce clearly to the room in plain words. "Gunshots in the lobby. Get out the side doors now." Clear words beat codes when the congregation needs to move.
- **Direct people:** point to the safest exits, away from the threat. People in shock freeze, and a firm voice gets them moving.
- **Call 911:** give the address, the location of the threat, a description of the attacker, and the number of attackers if known.
- **Lock down:** secure the children's wing and any doors you can lock without moving toward the threat.
Don't go looking for the attacker unless MRBC's policy assigns that role to specific trained members.
After the first minute, keep reporting what you know to dispatch: where the attacker was last seen, what they're wearing, and the weapon.$t$, null, $t$What's your job as a team member in the first minute?$t$, array[$t$Find the attacker yourself$t$, $t$Wait for the team lead's instructions$t$, $t$Alert people, direct them to safe exits, call 911, and lock down what you can$t$], 2, $t$Sound the alarm, move people away from the threat, and get police on the way.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 7, $t$Protecting the children's wing$t$, $t$Children can't run, hide, or fight on their own. They depend on the adults with them.
At MRBC, when a lockdown is called, children's workers keep children in their classrooms, lock the doors, turn off the lights, and move the children away from the door and out of view. Teachers take the class roster with them.
If an evacuation is called instead, teachers lead children out the nearest safe exit to the designated meeting area, counting them as they go. Older children can hold hands in a line. Infants go in evacuation cribs or are carried.
Parents will want to run to their children. During a lockdown, that can put both the parent and the children in danger. Team members near the children's wing should remind parents that the children are with trained adults and will be reunited as soon as it's safe.
Children's workers should practice lockdowns a few times a year, using kind, calm language with the children, such as "We're going to play the quiet game."$t$, null, $t$During a lockdown, a parent tries to get into the locked children's wing. What do you say?$t$, array[$t$"The children are locked in with their teachers. Stay with me and we'll reunite you when it's safe."$t$, $t$"There's nothing I can do."$t$, $t$"Go ahead, they're your kids."$t$], 0, $t$Opening doors during a lockdown puts everyone at risk. Reassure parents that children are protected.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 8, $t$When police arrive$t$, $t$The first officers to arrive will go straight toward the threat. They won't stop to help the wounded or answer questions. Their job is to stop the killing.
Officers don't know who the attacker is. Anyone holding something in their hands could be mistaken for a threat.
- Drop anything in your hands, including radios and phones.
- Keep your hands raised, empty, and visible, with fingers spread.
- Follow every command right away, even if it's shouted or seems rude.
- Don't run toward officers, grab them, or point.
- If you have information, give it quickly and calmly when asked: the location of the attacker, how many, and what they look like.
Armed team members must follow MRBC's policy for police arrival, which typically includes holstering weapons and identifying themselves before officers arrive. A person holding a gun when officers enter is in grave danger.$t$, null, $t$Police rush in while you're holding a radio and phone. What do you do?$t$, array[$t$Ask them to help the wounded first$t$, $t$Run to them and point toward the attacker$t$, $t$Drop what you're holding, keep your hands visible, and follow their commands$t$], 2, $t$Officers don't know who the attacker is. Empty, visible hands keep you safe.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 9, $t$Caring for the wounded$t$, $t$Uncontrolled bleeding is the leading cause of preventable death after an attack. Wounded people can bleed to death in a few minutes, long before ambulances are allowed in.
Once the threat is stopped or you're in a safe location, bleeding control saves lives. The Medical Emergencies class covers the hands-on steps in detail. Here, remember the priorities:
- Your own safety first. Don't move into an area that police haven't cleared.
- Find the bleeding, and press hard on it.
- Use the bleeding control kits placed around the building, which contain tourniquets, gauze, and gloves.
- Tell officers or medics where wounded people are.
Police and fire departments may set up a casualty collection point, a safe spot where wounded people are gathered for treatment. Follow their directions about moving the injured.
Know where every bleeding control kit is located on your post. In a crisis, there's no time to search.$t$, null, $t$After an attack, a wounded man is in a hallway police haven't cleared yet. What do you do?$t$, array[$t$Run in to get him right away$t$, $t$Tell officers where he is and help as soon as the area is safe or they direct you$t$, $t$Assume someone else will help him$t$], 1, $t$Entering an uncleared area can add another victim. Report his location and help once it's safe.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 10, $t$Reunification and recovery$t$, $t$After the threat is over, the hard work of bringing families together begins.
Police may hold everyone at the scene for questioning, which can take hours. Cooperate fully, and don't leave until officers say it's okay.
Children are reunited with parents at a reunification point chosen ahead of time, often a nearby building. Children's workers use check-in records to account for every child and release each one only to an authorized adult. This prevents children from being taken in the confusion and helps police know who might still be missing.
Church leadership will coordinate with police on communication. Team members should not speak to the media or post about the event.
The emotional recovery takes far longer. Survivors, witnesses, and responders may need counseling. Expect strong reactions in yourself and others. Pastors, counselors, and community resources will be part of the recovery plan.$t$, null, $t$After police clear the building, how do you account for children?$t$, array[$t$Wait for children to find their parents$t$, $t$Let parents search the classrooms$t$, $t$Use the check-in records at the reunification point$t$], 2, $t$Check-in records let you account for every child and release them only to the right adult.$t$),
  ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 11, $t$Getting ready before anything happens$t$, $t$The time to prepare is now, while everything is calm.
- **Exits:** keep every exit unlocked from the inside, unblocked, and clearly marked. Walk your post and know where each one leads.
- **Doors and locks:** know which interior doors lock, who has keys, and how to lock them quickly. Classroom doors that lock from the inside are worth the investment.
- **Bleeding control kits:** know where they are, check them regularly, and replace anything used or expired.
- **Communication:** agree on code phrases, test radios, and make sure the team can reach 911 from every post.
- **Drills:** practice lockdown and evacuation with staff and children's workers, and walk through scenarios as a team.
- **Relationships:** invite local police to tour the building, share floor plans, and learn how they would respond. Officers who know the building respond faster.
- **The congregation:** without causing fear, teach members to notice exits and follow team directions.
Every one of these steps also helps with fires, medical emergencies, and severe weather.$t$, null, $t$Which of these is a good way to prepare for a possible attack?$t$, array[$t$Keep the plan secret from children's workers$t$, $t$Keep side doors chained shut during services$t$, $t$Invite local police to tour the building and share floor plans$t$], 2, $t$Police who know the building respond faster. Exits must stay usable, and workers need to know the plan.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 1, $t$What is the national guidance for responding to an active attacker?$t$, array[$t$Run, hide, fight$t$, $t$Fight, run, report$t$, $t$Freeze, assess, act$t$, $t$Hide, wait, pray$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 2, $t$When should you fight an attacker?$t$, array[$t$Whenever you see one$t$, $t$Never$t$, $t$Only if you're on the safety team$t$, $t$As a last resort, when your life is in immediate danger$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 3, $t$What makes a good hiding place?$t$, array[$t$A room with a lockable or barricadable door$t$, $t$The middle of the sanctuary$t$, $t$Under the pews$t$, $t$A hallway$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 4, $t$What should you do with your belongings when running?$t$, array[$t$Put them in a pile by the door$t$, $t$Leave them behind$t$, $t$Grab as much as you can carry$t$, $t$Hand them to a team member$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 5, $t$How should you warn the congregation to evacuate?$t$, array[$t$Use a code word only$t$, $t$Stay quiet to avoid panic$t$, $t$Wait for the pastor to announce it$t$, $t$Use clear, plain words that tell people where to go$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 6, $t$During a lockdown, what do children's workers do?$t$, array[$t$Send children to find their parents$t$, $t$Keep children in locked classrooms, away from the door and out of view$t$, $t$Lead children to the sanctuary$t$, $t$Leave the children and run$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 7, $t$What's the first priority for the officers who arrive first?$t$, array[$t$Stopping the attacker$t$, $t$Setting up a perimeter$t$, $t$Helping the wounded$t$, $t$Questioning witnesses$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 8, $t$What's the leading cause of preventable death after an attack?$t$, array[$t$Uncontrolled bleeding$t$, $t$Panic$t$, $t$Broken bones$t$, $t$Smoke inhalation$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 9, $t$Why are check-in records used during reunification?$t$, array[$t$To bill parents$t$, $t$To account for every child and release them only to authorized adults$t$, $t$To give to the media$t$, $t$To find out who attended church that day$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51', 10, $t$Who should speak to the media after an incident?$t$, array[$t$Any team member who witnessed it$t$, $t$Nobody ever$t$, $t$Church leadership, in coordination with police$t$, $t$The first person asked$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
update public.training_classes set minutes = 30 where id = '7a3c2560-3c2d-4b96-8ddb-5b6f1bfcea51';

-- Class 5
delete from public.training_progress where class_id = '8dddf7b8-2097-41bb-af1e-b772ef2ad788';
delete from public.training_lessons where class_id = '8dddf7b8-2097-41bb-af1e-b772ef2ad788';
delete from public.training_questions where class_id = '8dddf7b8-2097-41bb-af1e-b772ef2ad788';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 1, $t$The first sixty seconds$t$, $t$Medical emergencies are the most common serious incident at church. Congregations include older adults, people with heart conditions and diabetes, pregnant women, and small children, all gathered in one place for hours. What the team does in the first minute often matters more than anything that happens later.
When someone goes down, follow the same steps every time:
- **Check the scene.** Make sure nothing will hurt you, such as traffic, electricity, or an aggressive person.
- **Check the person.** Tap their shoulder and shout, "Are you okay?" Look for normal breathing for no more than ten seconds.
- **Send for help by pointing at people.** "You in the blue shirt, call 911 and come back. You in the red, bring the AED and first aid kit."
- **Put on gloves** from the kit when you can, without delaying lifesaving care.
- **Start care** based on what you find.
Most states have Good Samaritan laws that protect people who give reasonable emergency help in good faith. Don't let fear of doing something wrong stop you from doing something.
This class teaches awareness. Hands-on certification from the American Heart Association or the Red Cross is still needed for CPR and first aid skills.$t$, null, $t$An older man collapses in the foyer. What's your first move?$t$, array[$t$Start CPR right away$t$, $t$Run to find a doctor in the congregation$t$, $t$Make sure the scene is safe, then check if he responds$t$], 2, $t$Scene safety first, then check responsiveness. Then send specific people for 911 and the AED.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 2, $t$Hands-only CPR$t$, $t$When an adult suddenly collapses and isn't breathing normally, their heart has likely stopped. Gasping or snoring sounds are not normal breathing. Without CPR, the chance of survival drops about ten percent every minute.
The American Heart Association teaches hands-only CPR for anyone who sees a teen or adult collapse:
- Place the heel of one hand in the center of the chest, with your other hand on top.
- Lock your elbows and keep your shoulders right over your hands.
- Push hard, at least two inches deep, and fast, between one hundred and one hundred twenty pushes a minute. The beat of the song "Stayin' Alive" is about right.
- Let the chest come all the way back up between pushes.
- Don't stop except to use the AED, or when medics take over.
CPR is exhausting. Switch with another trained person about every two minutes, swapping quickly so pushes barely pause.
Children, infants, and people who collapse from drowning also need rescue breaths. Formal CPR training covers those skills.
The short video below from the American Heart Association shows hands-only CPR.$t$, $t$https://www.youtube.com/watch?v=zSgmledxFe8$t$, $t$You've been doing compressions for two minutes and your arms are tiring. A trained teammate is beside you. What now?$t$, array[$t$Stop and wait for the ambulance$t$, $t$Swap quickly so the pushes barely pause$t$, $t$Slow down to save energy$t$], 1, $t$Tired rescuers push too shallow. Switching about every two minutes keeps compressions strong.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 3, $t$Using the AED$t$, $t$An automated external defibrillator, or AED, can shock a stopped heart back into a normal rhythm. It's designed for untrained people, and it won't shock someone who doesn't need it.
- Turn it on. The device talks you through every step.
- Expose the chest. Wipe it dry if it's wet, and shave or quickly remove heavy chest hair if the kit includes a razor.
- Place the pads exactly as the pictures show, usually one below the right collarbone and one on the left side below the armpit. Move the pad an inch away from any implanted device or medication patch.
- Plug in the connector if needed, and let the AED analyze. Nobody touches the person while it does.
- If it advises a shock, say "Clear," check that nobody is touching, and press the button.
- Start CPR again right after the shock, and keep following the prompts.
Use child pads or the child setting for kids under eight if available. If not, adult pads are better than nothing.
Know where MRBC's AED is, and check monthly that its status light is green and the pads haven't expired.$t$, null, $t$The AED is analyzing. A family member is holding the man's hand. What do you do?$t$, array[$t$Let them stay, since it's comforting$t$, $t$Tell everyone to stand clear and not touch him$t$, $t$Unplug the AED and start over$t$], 1, $t$Movement or touch can interfere with the analysis, and anyone touching during a shock can be hurt.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 4, $t$Stopping severe bleeding$t$, $t$A person with severe bleeding can die within five minutes, often before an ambulance arrives. The American College of Surgeons' Stop the Bleed program teaches bystanders to act right away.
Severe bleeding looks like blood that is spurting, pooling on the ground, soaking through clothes, or not slowing down.
- **Call 911,** or have someone call.
- **Find the source.** Open or cut away clothing to see exactly where the blood is coming from.
- **Press hard** directly on the wound with gauze, a clean cloth, or your gloved hands. Push with both hands and your body weight.
- **Pack deep wounds.** For wounds in the neck, armpit, or groin where a tourniquet won't fit, stuff gauze firmly into the wound, then hold hard pressure for at least three minutes.
- **Don't lift to peek.** If blood soaks through, add more gauze on top and keep pressing.
The video below from the American College of Surgeons shows how to apply pressure and pack a wound.$t$, $t$https://www.youtube.com/watch?v=7LEqWoK_aS0$t$, $t$Blood is soaking through the cloth you're pressing on a leg wound. What do you do?$t$, array[$t$Remove the cloth to look at the wound$t$, $t$Stop pressing and wait for EMS$t$, $t$Leave it, add more on top, and keep pressing hard$t$], 2, $t$Removing soaked gauze pulls away the clot that's forming. Add more and keep pressure on.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 5, $t$Using a tourniquet$t$, $t$For life-threatening bleeding from an arm or leg, a tourniquet is the fastest way to stop it.
- Place it two to three inches above the wound, between the wound and the heart. Don't place it on a joint. If you can't tell where the wound is, go high and tight on the limb.
- Pull the strap tight, then twist the rod until the bleeding stops. This will hurt, and that's expected.
- Lock the rod in place.
- Note the time it went on. Write it on the tourniquet or the person's skin if you can.
- Never loosen or remove it. Only medical professionals should do that.
- If the bleeding doesn't stop, put a second tourniquet above the first.
Commercial tourniquets from the bleeding control kit work far better than improvised ones like belts or neckties. Know where MRBC's kits are, and practice with a training tourniquet so your hands know the steps.
Modern tourniquets are safe for hours. Old fears about losing a limb shouldn't stop you from using one when someone is bleeding to death.$t$, null, $t$You've applied a tourniquet and the bleeding has stopped. The person says it hurts. What do you do?$t$, array[$t$Remove it and switch to pressure$t$, $t$Loosen it a little for comfort$t$, $t$Leave it in place, reassure them, and note the time it went on$t$], 2, $t$Tourniquets hurt when they work. Never loosen one. Medical professionals will manage it.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 6, $t$Choking$t$, $t$A person who is choking can't breathe, speak, or cough effectively. They may clutch their throat.
Ask, "Are you choking? Can I help?" If they can cough forcefully or speak, encourage them to keep coughing and stay with them.
If they can't breathe or speak, act:
- Stand behind them and wrap your arms around their waist.
- Make a fist and place the thumb side just above the belly button, well below the breastbone.
- Grab your fist with your other hand and give quick, upward thrusts into the abdomen.
- Keep going until the object comes out or they become unresponsive.
For a pregnant woman or a very large person, place your hands in the center of the chest and give chest thrusts instead.
For infants under one year, support the baby face down on your forearm and give five firm back blows between the shoulder blades, then turn the baby over and give five chest thrusts with two fingers. Repeat.
If the person becomes unresponsive, lower them to the floor, call 911, and start CPR. Look in the mouth before rescue breaths, and remove any object you can see.$t$, null, $t$A woman at the fellowship meal is clutching her throat and can't speak. What do you do?$t$, array[$t$Wait to see if she coughs it up$t$, $t$Ask if she's choking, then give abdominal thrusts until the object comes out$t$, $t$Pat her back gently and give her water$t$], 1, $t$If someone can't breathe or speak, abdominal thrusts are the first action. Don't give water.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 7, $t$Heart attack and stroke$t$, $t$A heart attack happens when blood flow to part of the heart is blocked. The person is usually awake and talking. Signs include:
- Pressure, squeezing, or pain in the center of the chest that lasts more than a few minutes.
- Pain spreading to the arm, back, neck, jaw, or stomach.
- Shortness of breath, cold sweat, nausea, or lightheadedness.
Women, older adults, and people with diabetes often have less typical signs, such as unusual tiredness, nausea, or back pain without much chest pain.
Call 911 right away. Have them sit and rest. The dispatcher may advise chewing an aspirin if they aren't allergic.
A stroke happens when blood flow to the brain is blocked. Use BE FAST:
- **Balance:** sudden loss of balance.
- **Eyes:** sudden vision changes.
- **Face:** one side drooping.
- **Arms:** one arm drifting down.
- **Speech:** slurred or strange.
- **Time:** call 911 now.
Note the time the person was last seen normal. Doctors use that time to decide on treatment.$t$, null, $t$Someone's face is drooping and their speech is slurred. What do you suspect?$t$, array[$t$They're just tired$t$, $t$A stroke, so call 911 right away$t$, $t$Low blood sugar$t$], 1, $t$Face drooping and slurred speech are BE FAST warning signs. Every minute counts.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 8, $t$Diabetic emergencies and seizures$t$, $t$Low blood sugar can come on quickly, especially if someone with diabetes skipped a meal before a long service. Signs include shakiness, sweating, confusion, irritability, and acting drunk.
If the person is awake and can swallow, give them sugar: juice, regular soda, glucose tablets, or candy. Have them rest. If they don't improve in about fifteen minutes, give more sugar and call 911. If they can't swallow safely or are unresponsive, call 911 and give nothing by mouth.
During a seizure, a person may stiffen, jerk, stare blankly, or fall. Your job is to keep them safe:
- Time the seizure.
- Move hard or sharp objects away, and cushion their head.
- Don't hold them down, and never put anything in their mouth.
- When the jerking stops, roll them onto their side to keep their airway clear.
Call 911 if the seizure lasts more than five minutes, if another seizure follows, if they're injured, pregnant, or in water, or if it's their first seizure. Stay with them as they recover, since confusion is common.$t$, null, $t$A man is having a seizure on the floor of the fellowship hall. What should you do?$t$, array[$t$Time it, clear the area, cushion his head, and roll him onto his side when it stops$t$, $t$Put a spoon in his mouth so he doesn't bite his tongue$t$, $t$Hold his arms still$t$], 0, $t$Protect the person, don't restrain them or put anything in their mouth, and call 911 if it lasts over five minutes.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 9, $t$Allergic reactions, fainting, and overdose$t$, $t$A severe allergic reaction, called anaphylaxis, can close the airway within minutes. Signs include hives, swelling of the face or tongue, wheezing, trouble breathing, and vomiting after contact with food, insect stings, or medicine.
Call 911. If the person has an epinephrine auto-injector, help them use it. Press it firmly against the outer thigh, through clothing if needed, and hold it for the time printed on the device. A second dose may be needed if symptoms don't improve.
Fainting is common in warm, crowded services, especially during long periods of standing. If someone feels faint, help them sit or lie down. If they faint, lay them flat and raise their legs about twelve inches. Most recover within a minute. Call 911 if they don't wake up quickly, are injured from the fall, are pregnant, or have chest pain.
An opioid overdose causes slow or stopped breathing, pinpoint pupils, blue lips, and unresponsiveness. Call 911 and give naloxone, also called Narcan, as a nasal spray if available. Start CPR if they aren't breathing normally.$t$, null, $t$A child at the potluck has hives, a swollen face, and is wheezing. Her mother has an epinephrine auto-injector. What happens?$t$, array[$t$Give her water and antihistamine only$t$, $t$Call 911 and help use the auto-injector on the outer thigh$t$, $t$Wait to see if the swelling goes down$t$], 1, $t$Swelling and wheezing are signs of anaphylaxis. Epinephrine and 911 come first.$t$),
  ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 10, $t$Heat, falls, and after the call$t$, $t$On hot days, outdoor events can cause heat illness. Heat exhaustion causes heavy sweating, weakness, nausea, and headache. Move the person to shade or air conditioning, loosen clothing, and give cool water. Heat stroke is an emergency: the person may be confused, stop sweating, or pass out. Call 911 and cool them quickly with cold water or ice packs on the neck, armpits, and groin.
Falls are common among older members. If someone falls and hits their head or neck, or can't get up, don't move them. Keep them still and call 911. Watch anyone who hit their head for confusion, vomiting, or drowsiness.
After any medical call:
- Hand off to medics with a short summary of what happened and what care was given.
- Keep the person's information private. Share it only with those involved in their care.
- File an incident report in the app the same day.
- Restock the first aid kit and bleeding control supplies, and report any used AED pads so they can be replaced.$t$, null, $t$An older woman fell in the parking lot, hit her head, and seems confused. What should you do?$t$, array[$t$Keep her still, call 911, and watch her closely$t$, $t$Help her up and walk her to her car$t$, $t$Give her water and let her rest in the lobby$t$], 0, $t$A head injury with confusion needs emergency care. Don't move her, and call 911.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 1, $t$What is the first step when someone collapses?$t$, array[$t$Start CPR$t$, $t$Check that the scene is safe$t$, $t$Call their family$t$, $t$Move them to a quiet room$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 2, $t$How fast should you push during hands-only CPR?$t$, array[$t$100 to 120 times a minute$t$, $t$30 times a minute$t$, $t$60 to 80 times a minute$t$, $t$As fast as possible$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 3, $t$How deep should chest compressions be for an adult?$t$, array[$t$One inch$t$, $t$At least two inches$t$, $t$Five inches$t$, $t$Half an inch$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 4, $t$What should happen while an AED analyzes the heart rhythm?$t$, array[$t$Nobody touches the person$t$, $t$Remove the pads$t$, $t$Keep doing CPR$t$, $t$Give rescue breaths$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 5, $t$Where should a tourniquet be placed?$t$, array[$t$Directly on the wound$t$, $t$Below the wound$t$, $t$Two to three inches above the wound, not on a joint$t$, $t$On the nearest joint$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 6, $t$What does the S in BE FAST stand for?$t$, array[$t$Stiffness$t$, $t$Speech$t$, $t$Sweating$t$, $t$Sight$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 7, $t$What should you give someone with low blood sugar who is awake and can swallow?$t$, array[$t$Insulin$t$, $t$Coffee$t$, $t$Juice, regular soda, or glucose tablets$t$, $t$Nothing$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 8, $t$What should you never do during a seizure?$t$, array[$t$Time it$t$, $t$Move sharp objects away$t$, $t$Put something in their mouth$t$, $t$Cushion their head$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 9, $t$Where is an epinephrine auto-injector usually given?$t$, array[$t$The neck$t$, $t$The outer thigh$t$, $t$The arm$t$, $t$The stomach$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('8dddf7b8-2097-41bb-af1e-b772ef2ad788', 10, $t$What should you do after a medical call ends?$t$, array[$t$File a report and restock the kits$t$, $t$Post a prayer request with the medical details$t$, $t$Share the details with the congregation$t$, $t$Nothing, since medics took over$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
update public.training_classes set minutes = 29 where id = '8dddf7b8-2097-41bb-af1e-b772ef2ad788';

-- Class 6
delete from public.training_progress where class_id = '0cb51b9d-fe93-4cc1-8a80-824222262674';
delete from public.training_lessons where class_id = '0cb51b9d-fe93-4cc1-8a80-824222262674';
delete from public.training_questions where class_id = '0cb51b9d-fe93-4cc1-8a80-824222262674';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 1, $t$Why child protection matters$t$, $t$Jesus said, "Let the little children come to me." Protecting them while they are in our care is one of the most important things a church does.
The risk is real. Studies from groups like Darkness to Light estimate that about one in ten children in the United States is sexually abused before turning eighteen. In most cases, the abuser is someone the child and family know and trust, not a stranger.
Churches can be attractive to people who want access to children. We are trusting by nature, we always need volunteers, and we value forgiveness and second chances. Those are good qualities, and they can be used against us.
Abuse also harms far beyond the child. Families leave the faith, congregations are torn apart, and churches face lawsuits and lost trust that take years to rebuild.
The safety team doesn't run the children's ministry, but we support it. We watch the children's wing, protect check-in and pickup, and know what to do when something seems wrong.$t$, null, $t$According to research, who is most likely to abuse a child?$t$, array[$t$A stranger who wanders into the building$t$, $t$Someone the child and family know and trust$t$, $t$Another child the same age$t$], 1, $t$Most abusers are known and trusted. That's why policies apply to everyone, not just strangers.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 2, $t$A safety system with five parts$t$, $t$No single step keeps children safe. MinistrySafe and other child-protection experts teach that churches need several layers working together.
- **Awareness training:** every adult who works with children learns how abusers operate, especially grooming. This is the foundation.
- **Skillful screening:** applications, references, and interviews designed to spot red flags.
- **Background checks:** a criminal records search for every adult who serves with children, renewed on a set schedule.
- **Policies and procedures:** written rules for supervision, restrooms, check-in, communication, and reporting.
- **Monitoring and oversight:** someone actually checks that the policies are being followed, every week.
Each part covers gaps in the others. A background check only finds people who have been caught and convicted, and most abusers never are. Training and policies catch what a background check can't.
The safety team helps most with the last part. Walking the children's wing, noticing a closed door, and checking that two adults are present are all monitoring.$t$, null, $t$Your church runs background checks on every volunteer. Is that enough?$t$, array[$t$No. Training, screening, policies and oversight all work together$t$, $t$Yes, a clean check means they're safe$t$, $t$Only for paid staff$t$], 0, $t$Most abusers have no criminal record. A background check is one part of a safety system, not the whole thing.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 3, $t$How grooming works$t$, $t$Grooming is the process an abuser uses to gain access to a child and avoid being caught. It often happens slowly, over months, and it targets the child, the parents, and the church.
The pattern usually follows these steps:
- **Targeting:** choosing a child who seems vulnerable, such as one who is lonely, from a struggling home, or hungry for attention.
- **Gaining trust:** becoming a helpful, admired figure to the family and the church.
- **Filling a need:** giving the child gifts, attention, rides, or special privileges.
- **Isolating:** finding ways to be alone with the child, such as tutoring, one-on-one mentoring, or rides home.
- **Testing boundaries:** small touches, inappropriate jokes, or rule-breaking that the child is asked to keep secret.
- **Maintaining control:** using secrecy, guilt, or threats to keep the child silent.
Many grooming behaviors look like kindness from the outside. The difference is in the pattern: special treatment of one child, a push for time alone, and a habit of bending rules.$t$, null, $t$Which pattern is a warning sign of grooming?$t$, array[$t$A teacher who greets every child by name$t$, $t$A volunteer who gives one child special gifts and offers to drive them home alone$t$, $t$A leader who follows the two-adult rule$t$], 1, $t$Singling out one child with gifts and seeking time alone are classic grooming steps.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 4, $t$Screening the people who serve$t$, $t$The best time to stop an abuser is before they ever reach a classroom.
At MRBC, everyone who serves with children should:
- Be a regular attender for at least six months before serving. Abusers often look for churches where they can volunteer quickly.
- Complete a written application that asks about past ministry and any history with abuse.
- Provide references, especially from past places they have worked with children. Those references should be called.
- Have an interview with a ministry leader.
- Pass a criminal background check, renewed on the church's schedule.
- Complete awareness training before their first day.
Red flags in screening include gaps in history, vague answers about why they left past roles, unusual eagerness to work with one age group, and pressure to skip steps because "everyone knows me."
Nobody is exempt, including pastors, longtime members, and relatives of staff. Applying the rules to everyone protects people who are innocent as well as children.$t$, null, $t$A longtime member wants to start helping in the nursery this Sunday and says "everyone knows me." What happens?$t$, array[$t$Let them help this week and do the paperwork later$t$, $t$They complete the same screening and training as everyone else before serving$t$, $t$Let them help, since they're well known$t$], 1, $t$The rules apply to everyone. Skipping steps for trusted people is exactly the gap abusers look for.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 5, $t$Two adults and clear sight lines$t$, $t$The two-adult rule is the most important supervision policy in children's ministry. A child should never be alone with a single adult who isn't their parent.
- At least two screened adults are present in every classroom. Ideally they are not married to or related to each other.
- When a child needs to leave the room, two adults go, or the child goes with a group.
- Classroom doors have windows, or stay open, so anyone in the hallway can see in.
- Don't cover door windows with paper or decorations.
- Avoid closets, storage rooms, and empty classrooms entirely with children.
The rule protects volunteers too. False accusations are rare, but when a volunteer is never alone with a child, there's nothing to question.
As a safety team member, part of your job is noticing when this rule slips. A single adult with one child, a covered window, or a closed door deserves a friendly, immediate check.$t$, null, $t$You see a volunteer alone with one child in a closed classroom. What should you do?$t$, array[$t$Nothing, they're a trusted volunteer$t$, $t$Mention it next month$t$, $t$Open the door, rejoin the group, and report it to the children's ministry leader$t$], 2, $t$One adult alone with one child out of sight breaks the policy that protects both the child and the volunteer.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 6, $t$Restrooms and diapering$t$, $t$Restrooms are one of the highest-risk places in a church because they are private by design.
For young children:
- Adults escort children to the restroom in pairs, or take a small group with two adults.
- Adults wait outside the stall or restroom door and help only as much as the child needs.
- Prop the outer restroom door open when children are using it.
- Children's ministry restrooms should be used only by children and their escorts during class times.
For diapering:
- Change diapers only in a designated area that is visible to other adults.
- Only screened volunteers or the child's own parents change diapers.
- Use gloves, and follow a written routine every time.
For older children, have them use the restroom in pairs or groups, and know how long they've been gone. Adults from outside the ministry should use restrooms away from the children's wing during class times.$t$, null, $t$A first-grader needs the restroom during class. What's the safe approach?$t$, array[$t$One teacher takes the child and closes the restroom door$t$, $t$Send the child alone, since they're old enough$t$, $t$Two adults or a small group with two adults go, and the adults wait outside the stall$t$], 2, $t$Restrooms are private by design, so supervision there follows the two-adult rule.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 7, $t$Check-in and pickup$t$, $t$A secure check-in system makes sure children go home only with the right adults.
- Every child is checked in by a parent or guardian, who receives a matching tag or code.
- The child's name tag lists allergies and medical needs, but not personal details like a home address.
- At pickup, the tag must match. No tag, no release, with no exceptions.
- If a parent loses their tag, the children's ministry leader verifies their identity using the check-in records and photo ID before releasing the child.
- Custody restrictions on file are flagged in the system so workers know who may not pick up a child.
Pickup is a busy, crowded time, and that's when mistakes happen. Team members near the children's wing should watch for anyone who seems hurried, argumentative, or unfamiliar, and for children leaving the wing without an adult.
If someone tries to take a child without authorization, don't physically struggle over the child. Keep the child with the workers, call the team lead, and call police if the person leaves with or tries to take a child by force.$t$, null, $t$A woman you don't recognize asks to pick up a child but doesn't have the matching tag. What happens?$t$, array[$t$Release the child if the child seems to know her$t$, $t$Don't release the child. Call the team lead and the parent who checked them in$t$, $t$Ask her to describe the child$t$], 1, $t$No matching tag means no release, no exceptions. The parent and team lead sort it out.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 8, $t$Boundaries and communication$t$, $t$Clear boundaries make it easier to spot behavior that crosses a line.
**Physical contact:** appropriate touch is public, brief, and for the child's benefit. Side hugs, high fives, and a hand on the shoulder are fine. Lap sitting with older children, prolonged hugs, tickling, and wrestling are not.
**Communication:** adults don't send private messages to children. Texts, emails, and social media messages to minors should include a parent or another leader. Adults don't follow or friend children on personal accounts.
**Gifts and favoritism:** gifts should go to the whole group, not one child. Special treatment of a single child is a red flag.
**Outside contact:** rides, babysitting, tutoring, and outings with church children should follow MRBC's policy, which usually requires parent permission and another adult present.
**Language and media:** no jokes or conversations of a sexual nature, and no showing children inappropriate content.
When you see a boundary crossed, it's not an accusation to say something. It's following the policy. Report it to the children's ministry leader, even if it seems small.$t$, null, $t$A youth volunteer has been privately texting a thirteen-year-old late at night. What should happen?$t$, array[$t$Ask the volunteer to text less often$t$, $t$Nothing, if the messages seem friendly$t$, $t$Report it to the children's or youth ministry leader right away$t$], 2, $t$Private messages between adults and minors break policy and can be a grooming step. Report it.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 9, $t$Supervision, ratios, and peer abuse$t$, $t$Not all harm comes from adults. Peer-to-peer abuse, where one child harms another, makes up a significant share of abuse reports in ministry settings.
Good supervision prevents it:
- Keep adult-to-child ratios suited to the age group. Younger children need more adults per child.
- Separate children by age when possible. Large age gaps in unsupervised groups raise risk.
- Watch transitions, hallways, restrooms, and playgrounds closely. These are where supervision slips.
- At youth events and overnight trips, follow written rules for sleeping arrangements, room checks, and lights out.
- Stop bullying, sexual talk, and rough play immediately, and report it.
Older children sometimes copy behavior they've experienced or seen. Report concerning behavior between children the same way you'd report adult behavior, because the child acting out may be a victim too.$t$, null, $t$Two older boys keep taking a younger boy behind the gym during the youth event. What should you do?$t$, array[$t$Step in right away, bring the children back to the group, and report it$t$, $t$Assume they're just playing$t$, $t$Wait for the event to end and tell the parents$t$], 0, $t$Unsupervised areas and age gaps raise risk. Step in, supervise, and report what you saw.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 10, $t$Signs a child may be hurting$t$, $t$Children rarely tell an adult directly. More often, abuse shows up in changes.
Physical signs can include:
- Bruises, burns, or injuries with explanations that don't fit.
- Injuries in unusual places, such as the back, ears, or upper arms.
- Pain, itching, or bleeding in private areas, or trouble walking or sitting.
Behavioral signs can include:
- Sudden changes in mood, sleep, appetite, or school performance.
- Fear of a certain person or place, or reluctance to go home.
- Sexual knowledge or behavior that's unusual for the child's age.
- Withdrawal, anxiety, or regression, such as bedwetting in an older child.
- Running away, self-harm, or substance use in teens.
One sign alone doesn't prove abuse. Children go through hard seasons for many reasons. But you don't need proof to make a report. A reasonable suspicion is enough, and investigators will sort out the facts.$t$, null, $t$Do you need proof before reporting suspected abuse?$t$, array[$t$No. A reasonable suspicion is enough, and investigators determine the facts$t$, $t$Yes, or you could ruin someone's reputation$t$, $t$Only if the child tells you directly$t$], 0, $t$The law asks for a report based on reasonable suspicion. Proof is the investigators' job.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 11, $t$When a child tells you$t$, $t$If a child tells you about abuse, how you respond can shape whether they ever tell anyone again.
- **Stay calm.** Your face and voice should stay steady, even if you feel shocked or angry.
- **Listen.** Let them tell it in their own words. Don't push for details.
- **Believe them.** Say, "Thank you for telling me. You did the right thing."
- **Don't promise secrecy.** Say, "I'm going to tell some people whose job it is to help keep you safe."
- **Don't investigate.** Don't ask leading questions, examine injuries, or confront the person they named.
- **Keep them safe.** Make sure the child isn't sent home with or left alone with the person they named.
- **Write it down.** As soon as possible, record exactly what the child said, using their words, along with the date and time.
Then report right away, following the steps in the next slide. Your job is not to decide whether it's true. Your job is to make sure the right people hear it.$t$, null, $t$A child tells you something that sounds like abuse. What do you say?$t$, array[$t$"Thank you for telling me. You did the right thing." Then report it right away$t$, $t$"I promise I won't tell anyone."$t$, $t$"Are you sure? That's a serious thing to say."$t$], 0, $t$Stay calm, believe them, don't promise secrecy, and report through MRBC's process and state law.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 12, $t$Making the report$t$, $t$Every state requires certain people to report suspected child abuse, and many states require every adult to report. Telling a church leader does not replace the legal duty to report to authorities.
At MRBC:
- If a child is in immediate danger, call 911 first.
- Report the suspicion to the state child abuse hotline or local law enforcement as required by state law. Do this the same day.
- Notify the children's ministry leader and the pastor, so the church can protect the child and respond.
- Document what you saw or heard, who you reported to, and when.
Don't tell the person suspected, and don't share details with others in the church. Leaders will decide what's communicated, with care for the child and the investigation.
If the person named serves at the church, leadership will remove them from ministry while the investigation proceeds. That protects everyone, including the accused.
Reporting can feel frightening, especially when the person is someone you know. Remember that a report starts a careful process. It isn't a verdict. Not reporting can leave a child in danger.$t$, null, $t$A volunteer confides that they suspect a child is being abused at home, but they told the pastor and think that's enough. Is it?$t$, array[$t$No. The suspicion also needs to be reported to the state hotline or police as required by law$t$, $t$Only if the pastor agrees$t$, $t$Yes, the pastor will handle it$t$], 0, $t$Telling church leaders doesn't replace the legal duty to report to authorities.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 13, $t$Photos, video, and online safety$t$, $t$Children's images and information need protection too.
- Take photos of children only with church devices or as MRBC's media policy allows, and only for ministry purposes.
- Get written permission from parents before posting any child's photo. Keep a list of families who have said no, and respect it.
- Never post a child's full name, school, or schedule with their photo. That information can help someone find them.
- Livestreams and recordings should point away from children's areas and away from the front rows when children are singing or being recognized, unless parents have agreed.
- Volunteers shouldn't take or keep personal photos of children they serve.
Online, abusers often reach children through games, apps, and social media. Encourage parents to know who their children talk to online, and share any concerning messages a child shows you with the ministry leader.
If you see someone photographing or filming children in a way that seems out of place, such as from a car or without connection to any family, report it to the team lead right away.$t$, null, $t$A visitor is filming the children's choir up close and asks for the children's names. What should happen?$t$, array[$t$Ask the visitor to send you the video$t$, $t$Don't share names, and let the team lead know so someone can check in with the visitor$t$, $t$Give the names, since it's a public event$t$], 1, $t$Names with images help someone find a child. Protect identities and report unusual filming.$t$),
  ('0cb51b9d-fe93-4cc1-8a80-824222262674', 14, $t$When someone with a past wants to attend$t$, $t$Sometimes a person with a history of sexual offenses wants to attend church. The gospel offers hope to everyone, and churches can welcome them while still protecting children.
The approach most churches use is a written attendance agreement, managed by the pastor and church leadership. These agreements usually include:
- No serving in any ministry, and no access to children's or youth areas.
- A designated escort who accompanies the person whenever they are on church property, including restrooms.
- Attending only specific services, and arriving and leaving at set times.
- No contact with children, and no attending events where children are present without an escort.
- Agreement that breaking any term ends attendance.
The safety team's role is to know the plan, recognize the person, and quietly confirm that the terms are being followed. Keep the details confidential. Gossip doesn't protect anyone, and it can drive the person away from accountability.
If you learn that someone with this history is attending without an agreement, tell the pastor privately.$t$, null, $t$Who should know the details of an attendance agreement?$t$, array[$t$Nobody except the person who signed it$t$, $t$The whole congregation, for transparency$t$, $t$Church leadership and the safety team, kept confidential$t$], 2, $t$The team needs the details to monitor the agreement. Spreading them helps no one.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 1, $t$What does a background check find?$t$, array[$t$Every abuser$t$, $t$Nothing useful$t$, $t$Only people who have been caught and convicted$t$, $t$People who are being groomed$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 2, $t$Which is the first step in the grooming pattern?$t$, array[$t$Threatening the child$t$, $t$Applying to volunteer$t$, $t$Targeting a vulnerable child$t$, $t$Meeting the pastor$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 3, $t$How long should someone attend before serving with children?$t$, array[$t$One Sunday$t$, $t$At least six months$t$, $t$One month$t$, $t$Two years$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 4, $t$What is the two-adult rule?$t$, array[$t$Two adults must approve every new volunteer$t$, $t$Two adults sign each check-in tag$t$, $t$Two adults lead each service$t$, $t$A child is never alone with a single adult who isn't their parent$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 5, $t$Why should classroom doors have windows or stay open?$t$, array[$t$So anyone in the hallway can see in$t$, $t$For ventilation$t$, $t$So children can leave easily$t$, $t$To save money on lighting$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 6, $t$What should happen if a parent lost their pickup tag?$t$, array[$t$Release the child if the parent seems familiar$t$, $t$Another parent vouches for them$t$, $t$The child waits until the parent finds the tag$t$, $t$The leader verifies identity with records and photo ID before releasing the child$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 7, $t$Which kind of physical contact is appropriate with children?$t$, array[$t$Side hugs and high fives$t$, $t$Tickling$t$, $t$Lap sitting with older children$t$, $t$Wrestling$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 8, $t$Which statement about peer-to-peer abuse is true?$t$, array[$t$It's always just play$t$, $t$It only happens on overnight trips$t$, $t$It doesn't happen in church settings$t$, $t$It makes up a significant share of abuse reports, so supervision matters$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 9, $t$What should you avoid doing when a child discloses abuse?$t$, array[$t$Promising to keep it a secret$t$, $t$Writing down their words$t$, $t$Thanking them for telling you$t$, $t$Staying calm$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('0cb51b9d-fe93-4cc1-8a80-824222262674', 10, $t$Who must the suspicion of abuse be reported to?$t$, array[$t$The state hotline or law enforcement, as required by law, and church leadership$t$, $t$Only the pastor$t$, $t$The person suspected$t$, $t$The child's parents$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
update public.training_classes set minutes = 30 where id = '0cb51b9d-fe93-4cc1-8a80-824222262674';

-- Class 7
delete from public.training_progress where class_id = '531507c8-e55d-467a-86b2-1589c54c4a0c';
delete from public.training_lessons where class_id = '531507c8-e55d-467a-86b2-1589c54c4a0c';
delete from public.training_questions where class_id = '531507c8-e55d-467a-86b2-1589c54c4a0c';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 1, $t$How church fires start$t$, $t$According to the National Fire Protection Association, local fire departments respond to well over a thousand fires at houses of worship each year. Knowing the common causes helps the team prevent most of them.
- **Cooking:** kitchens are the leading cause. Fellowship meals, unattended stoves, grease, and volunteers unfamiliar with the equipment are a risky mix.
- **Intentional fires:** arson is a leading cause of the most damaging church fires, often set at night when the building is empty.
- **Electrical:** overloaded power strips, damaged cords, old wiring, and space heaters.
- **Candles:** especially during holiday services, candlelight vigils, and weddings.
- **Heating equipment:** furnaces and boilers that haven't been serviced.
Fires spread fast. Modern furnishings burn hotter than older materials, and a room can fill with deadly smoke in just a few minutes. That's why early detection and quick evacuation matter more than anything else.
The safety team's role is to spot hazards before they become fires, sound the alarm early, and get everyone out safely.$t$, null, $t$What's the leading cause of fires at houses of worship?$t$, array[$t$Candles$t$, $t$Lightning$t$, $t$Cooking$t$], 2, $t$Kitchens cause more church fires than anything else, so watch them closely during fellowship meals.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 2, $t$The prevention walk$t$, $t$Many fires can be stopped before they start. Before each service, walk your area and look for hazards.
- Exits and hallways are clear of chairs, boxes, and decorations.
- Exit signs are lit, and exit doors open from the inside without a key.
- Fire doors close fully and aren't propped open.
- Fire extinguishers are in place, visible, and show a charged gauge in the green.
- Power strips aren't plugged into other power strips, and cords aren't running under rugs or through doorways.
- Space heaters, if allowed at all, are at least three feet from anything that burns and are never left unattended.
- Kitchen burners and ovens are off unless someone is actively cooking.
- Candles are in stable holders, away from curtains and decorations, and attended.
- Trash and recycling aren't piled against the building, where they could be set on fire.
Report anything you can't fix right away to the team lead, and note it in the app so facilities can follow up.$t$, null, $t$During your walk, you find a power strip plugged into another power strip behind the stage. What do you do?$t$, array[$t$Unplug the chain if it's safe to, and report it so it can be fixed properly$t$, $t$Leave it, since it's working$t$, $t$Add a third power strip to spread the load$t$], 0, $t$Chained power strips overload easily and start fires. Fix what you can and report the rest.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 3, $t$RACE: what to do when you find fire$t$, $t$When you discover a fire, the RACE steps put the most important things first.
- **Rescue:** get anyone in immediate danger away from the fire. Don't put yourself at serious risk to do it.
- **Alarm:** pull the nearest fire alarm, and call 911 from a safe place. Then radio the team. Don't assume someone else has called.
- **Contain:** close doors behind you as you leave. A closed door can slow fire and smoke dramatically and buy time for others.
- **Extinguish or evacuate:** if the fire is small and you're trained, you may try an extinguisher. Otherwise, evacuate.
Rescue and alarm often happen at the same time. One person moves people while another pulls the alarm and calls.
When you call 911, give the church address, where the fire is in the building, and whether anyone is trapped or hurt.
Most church fire alarms automatically alert a monitoring company. Call 911 anyway. Automatic alerts can be delayed or fail.$t$, null, $t$You smell smoke and find a small trash can fire in the kitchen. What comes first?$t$, array[$t$Take a photo for the report$t$, $t$Grab the extinguisher$t$, $t$Get anyone nearby away from it$t$], 2, $t$RACE starts with Rescue. People come first, then the alarm.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 4, $t$Using a fire extinguisher$t$, $t$Most church extinguishers are labeled ABC, which means they work on ordinary materials like paper and wood, flammable liquids, and electrical fires. Commercial kitchens should also have a Class K extinguisher for grease fires.
To use an extinguisher, remember PASS:
- **Pull** the pin, breaking the tamper seal.
- **Aim** low, at the base of the fire, where the fuel is.
- **Squeeze** the handle slowly and evenly.
- **Sweep** from side to side across the base of the fire.
Start about eight feet away and move closer as the fire goes down. Most extinguishers empty in ten to twenty seconds, so make every second count.
Never use water on a grease fire, because it causes burning grease to explode outward. For a small grease fire in a pan, turn off the heat and slide a lid over the pan.
After using an extinguisher, even briefly, report it so it can be recharged or replaced. A partly used extinguisher may not work next time.$t$, $t$https://www.youtube.com/watch?v=PQV71INDaqY$t$, $t$You're using an extinguisher. Where do you aim?$t$, array[$t$At the smoke$t$, $t$At the top of the flames$t$, $t$At the base of the fire, sweeping side to side$t$], 2, $t$Aim at the base where the fuel is. Spraying the flames does very little.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 5, $t$When not to fight a fire$t$, $t$An extinguisher is for small fires only. Knowing when to walk away is just as important as knowing how to use one.
Don't try to fight a fire if:
- It's bigger than a small trash can, or it's spreading quickly.
- The room is filling with smoke.
- You can't see the fire's source.
- You don't have a clear exit behind you.
- The extinguisher is the wrong type, or you're not sure how to use it.
- Your instinct tells you to leave.
Before fighting any fire, make sure someone has pulled the alarm and called 911, and that people are evacuating. Keep your back to the exit as you work, so you can get out.
If the extinguisher is empty and the fire isn't out, leave right away and close the door behind you.
Smoke kills far more people in fires than flames do. A few breaths of thick smoke can cause confusion or unconsciousness. No building or property is worth that risk.$t$, null, $t$The fire in the storage room is now as tall as you and smoke is filling the ceiling. What do you do?$t$, array[$t$Leave, close the door behind you, and make sure everyone is evacuating$t$, $t$Grab a second extinguisher and keep trying$t$, $t$Open the windows to let the smoke out$t$], 0, $t$A fire that size is beyond an extinguisher. Get out, contain it with the door, and let firefighters handle it.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 6, $t$Exits and fire doors$t$, $t$A building's exits and fire doors are designed to get people out and slow a fire. They only work if we keep them working.
- Never lock, chain, or block an exit door while the building is occupied. Exits must open from the inside with one simple motion, even if they're locked to the outside.
- Fire doors, often found in hallways and stairwells, are built to hold back fire and smoke. They must close and latch on their own. Never prop them open with wedges or chairs.
- Some fire doors are held open by magnets that release when the alarm sounds. Keep the space around them clear so they can close.
- Respect the posted occupancy limit for each room. Overcrowding slows evacuation. During busy services, the team lead may need to open overflow seating rather than packing more people in.
Security and fire safety sometimes pull in different directions. A door we want locked for security must still open from the inside for fire safety. If you see a conflict, raise it with the team lead and facilities rather than solving it with a chain.$t$, null, $t$It's a crowded Easter service and the sanctuary is past its posted limit. What should happen?$t$, array[$t$Keep seating people in the aisles$t$, $t$Lock the doors so no one else comes in$t$, $t$Tell the team lead so overflow seating can be opened$t$], 2, $t$Overcrowding slows evacuation. Overflow seating keeps the room within its safe limit.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 7, $t$Evacuating the sanctuary$t$, $t$A full sanctuary can empty in a few minutes if everyone knows the plan.
- **Assigned sections:** each usher or team member is responsible for a section of seating and the exit that section uses.
- **Clear directions:** use a calm, loud voice. "Please leave now through this door. Walk, don't run."
- **Nearest safe exit:** people tend to leave the way they came in. Direct them to the nearest safe exit instead, which may be a side door.
- **Keep moving:** encourage people to leave belongings and to keep going once they're outside.
- **Sweep:** once your section is empty, check restrooms, offices, and side rooms on your route, closing doors behind you.
The worship leader or pastor should know how to stop the service and give a short, calm instruction from the platform. A clear voice from the front helps people move.
Never use elevators during a fire. They can stop or open onto a fire floor.$t$, null, $t$The alarm sounds during worship but nobody sees fire. What do you do?$t$, array[$t$Start evacuating your section right away$t$, $t$Go look for the cause$t$, $t$Wait for the pastor to decide$t$], 0, $t$Treat every alarm as real. Evacuate first and let the fire department decide.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 8, $t$Children and people who need help$t$, $t$Some people can't evacuate on their own. Plan for them before the alarm sounds.
**Children:** teachers lead classes out the nearest safe exit to the children's assembly area, taking the class roster and counting children before leaving the room and again outside. Infants go in evacuation cribs or are carried. Children stay with their teachers outside until reunited through the check-in process, not grabbed by passing adults.
**People with disabilities:** people in wheelchairs, with walkers, with limited sight or hearing, or with cognitive challenges may need help. Ask how you can help rather than assuming. Assign a team member or volunteer to assist known members who need help.
**Upper floors:** if someone can't use the stairs, help them to a stairwell landing or designated area of refuge, stay with them if you can, and tell firefighters exactly where they are.
**Older adults:** many walk slowly. Keep traffic flowing around them so they aren't pushed.$t$, null, $t$A member who uses a walker is on the second floor when the alarm sounds. What should happen?$t$, array[$t$Leave them, since firefighters will search$t$, $t$Help them to the stairwell area of refuge and tell firefighters exactly where they are$t$, $t$Have them take the elevator$t$], 1, $t$Elevators are unsafe in a fire. Areas of refuge plus clear information help firefighters reach people quickly.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 9, $t$Moving through smoke$t$, $t$If you're caught in smoke, the air near the floor is cooler and cleaner.
- Get low and crawl on your hands and knees toward the nearest exit, keeping your head about one to two feet above the floor.
- Cover your nose and mouth with cloth if you can, but don't stop to look for one.
- Count doors as you go, so you know how far you are from the exit, and keep one hand on the wall.
- Before opening a closed door, feel it with the back of your hand. If it's hot, don't open it. Use another way out.
- If the door is cool, open it slowly and be ready to shut it if smoke or heat rushes in.
If you're trapped, close the door between you and the fire, stuff cloth under the door to block smoke, call 911 with your exact location, and signal from a window.
These skills matter for team members doing a final sweep, and they're worth sharing with children's workers and staff.$t$, null, $t$You reach a closed door while leaving a smoky hallway. What do you do first?$t$, array[$t$Feel it with the back of your hand to check for heat$t$, $t$Kick it open$t$, $t$Open it quickly$t$], 0, $t$A hot door means fire on the other side. Check before you open it.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 10, $t$Outside and accounted for$t$, $t$Getting out is only half the job. The team also needs to know that everyone is out.
- Everyone gathers at the planned assembly point, far enough away to leave room for fire trucks.
- Children's teachers count their classes against their rosters.
- Ushers and team members report to the team lead that their sections and sweeps are complete, and mention any rooms they couldn't check.
- The team lead gathers this information and meets the first fire officer, telling them who is missing and where they were last seen, and where the fire was found.
Never go back into a burning building, even for a person. Firefighters have the equipment and training to do it safely.
Keep people away from the building and out of the way of emergency vehicles. Nobody goes back inside until the fire department says it's safe, even if the alarm turns out to be false.
After the event, file an incident report and talk through what went well and what slowed people down.$t$, null, $t$Everyone is outside at the meeting point. A teacher says one child is missing. What happens?$t$, array[$t$Wait a few minutes for the child to show up$t$, $t$The team lead tells the fire department right away$t$, $t$The teacher goes back inside to look$t$], 1, $t$Never go back in. Firefighters need to know right away who's missing and where they were last seen.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 11, $t$Gas leaks and electrical hazards$t$, $t$Natural gas has an added odor that smells like rotten eggs. If you smell gas inside:
- Don't turn lights or electrical switches on or off, don't use phones inside, and don't light anything. A spark can ignite the gas.
- Get everyone out of the building, leaving doors open behind you if it's safe.
- Once outside and well away, call 911 and the gas company.
- Don't go back in until the gas company or fire department says it's safe.
For electrical hazards:
- If you see sparking, smell burning plastic, or find an outlet that is hot or discolored, stop using it and report it.
- If someone is being shocked, don't touch them. Turn off the power at the breaker if you can do it safely, or push them away from the source with something dry and non-conductive, like a wooden broom handle.
- Stay at least thirty feet away from downed power lines outside, and call the utility.$t$, null, $t$You smell a strong rotten-egg odor in the fellowship hall. What do you do?$t$, array[$t$Turn on the fans to clear the air$t$, $t$Get everyone out without touching switches, then call 911 and the gas company from outside$t$, $t$Call 911 from your phone right there$t$], 1, $t$Switches and phones can make sparks. Evacuate first and call from a safe distance.$t$),
  ('531507c8-e55d-467a-86b2-1589c54c4a0c', 12, $t$Bomb threats and suspicious items$t$, $t$Bomb threats are almost always hoaxes, but every one must be taken seriously. The Cybersecurity and Infrastructure Security Agency publishes a bomb threat checklist that should be kept near every phone.
If a threat comes by phone:
- Stay calm and keep the caller talking as long as possible.
- Ask where the bomb is, when it will go off, and what it looks like.
- Write down the exact words, the caller's voice, background noises, and the time.
- Don't hang up, and use another phone to call 911.
If you find a suspicious item, such as an unattended bag that doesn't belong, wires, or a package with an odd smell or leaking:
- Don't touch, move, or cover it.
- Move people away and keep them back.
- Don't use radios or cell phones within about three hundred feet, since signals could set off some devices.
- Report it to the team lead and call 911 from a safe distance.
The team lead and police will decide whether to evacuate or search. If evacuating, check the assembly point too, since a second device can be placed where people gather.$t$, null, $t$You find an unattended backpack under a pew with wires sticking out. What do you do?$t$, array[$t$Carry it outside$t$, $t$Open it to see what's inside$t$, $t$Don't touch it, move people away, and report it from a distance without using your radio nearby$t$], 2, $t$Never handle a suspicious item. Clear the area and report it from a safe distance.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 1, $t$What does the first C in RACE stand for?$t$, array[$t$Contain$t$, $t$Call$t$, $t$Check$t$, $t$Clear$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 2, $t$What do the letters PASS stand for?$t$, array[$t$Push, Activate, Spray, Stop$t$, $t$Pull, Alarm, Spray, Secure$t$, $t$Pull, Aim, Squeeze, Sweep$t$, $t$Prepare, Alert, Spray, Sweep$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 3, $t$What should you never use on a grease fire?$t$, array[$t$Turning off the heat$t$, $t$Water$t$, $t$A lid$t$, $t$A Class K extinguisher$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 4, $t$Which situation is too big for a fire extinguisher?$t$, array[$t$A small trash can fire$t$, $t$A pan fire with a lid nearby$t$, $t$A fire spreading quickly with smoke filling the room$t$, $t$A smoldering napkin$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 5, $t$Why should fire doors never be propped open?$t$, array[$t$They let in cold air$t$, $t$They're designed to close and hold back fire and smoke$t$, $t$They lock automatically$t$, $t$They're too heavy$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 6, $t$Why should you call 911 even if the fire alarm is monitored?$t$, array[$t$Automatic alerts can be delayed or fail$t$, $t$911 needs to approve the alarm$t$, $t$The monitoring company doesn't send help$t$, $t$It's faster to drive to the fire station$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 7, $t$Where is the air safest when moving through smoke?$t$, array[$t$Near the floor$t$, $t$Near the ceiling$t$, $t$Near windows$t$, $t$At eye level$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 8, $t$When can people go back inside after an evacuation?$t$, array[$t$When the pastor decides$t$, $t$When the fire department says it's safe$t$, $t$When the alarm stops$t$, $t$After ten minutes$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 9, $t$What should you avoid doing if you smell gas inside?$t$, array[$t$Keeping people away$t$, $t$Leaving the building$t$, $t$Calling the gas company from outside$t$, $t$Flipping light switches$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('531507c8-e55d-467a-86b2-1589c54c4a0c', 10, $t$What should you do if a bomb threat comes by phone?$t$, array[$t$Transfer the call to the pastor$t$, $t$Tell the caller you're calling police$t$, $t$Keep the caller talking and write down exactly what they say$t$, $t$Hang up right away$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
update public.training_classes set minutes = 29 where id = '531507c8-e55d-467a-86b2-1589c54c4a0c';

-- Class 8
delete from public.training_progress where class_id = '678301e7-1917-4814-b449-ac250c93bab9';
delete from public.training_lessons where class_id = '678301e7-1917-4814-b449-ac250c93bab9';
delete from public.training_questions where class_id = '678301e7-1917-4814-b449-ac250c93bab9';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('678301e7-1917-4814-b449-ac250c93bab9', 1, $t$Watches and warnings$t$, $t$Severe weather doesn't check the church calendar. Storms often arrive on Sunday mornings and Wednesday nights, when the building is full. The National Weather Service uses two main levels of alerts, and the difference shapes everything the team does.
- **Watch:** conditions are right for severe weather to develop. Stay alert, monitor updates, and get ready to act. A tornado watch often covers a large area for several hours.
- **Warning:** severe weather is happening or about to happen in your area. Take protective action now. A tornado warning means a tornado has been spotted or detected by radar.
A simple way to remember: a watch means be prepared, and a warning means take action.
There are also advisories for less dangerous weather, like dense fog or a little snow, and special statements for unusual conditions.
The short video below from the National Weather Service explains the difference between watches and warnings.$t$, $t$https://www.youtube.com/watch?v=x3V3HZBs1Y4$t$, $t$The weather radio says a tornado watch is in effect during the service. What does that mean?$t$, array[$t$The storm is over$t$, $t$Conditions make tornadoes possible, so stay alert and monitor$t$, $t$A tornado is coming right now$t$], 1, $t$A watch means be ready. A warning means take shelter now.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 2, $t$Staying informed$t$, $t$The team can't act on weather it doesn't know about. Sirens are designed to warn people outdoors, and they often can't be heard inside a full sanctuary during worship.
Use more than one source:
- **NOAA Weather Radio:** a battery-backed receiver that sounds an alarm for warnings in your county. Keep one at the team lead's post, turned on during every event.
- **Wireless Emergency Alerts:** these come to cell phones automatically for tornado and flash flood warnings. Phones in silent mode may still sound.
- **Weather apps and local media:** good for radar and updates, but check that alerts are turned on.
On days with a watch, the team lead should assign one person to monitor the weather throughout the service. That person tells the team lead right away when a warning is issued, and keeps tracking the storm's path and timing.
Know the name of your county and nearby counties, since warnings are issued by area. Knowing where storms are heading helps the team decide how soon to act.$t$, null, $t$Why shouldn't the team rely on outdoor sirens during a service?$t$, array[$t$Sirens are meant for people outdoors and often can't be heard inside$t$, $t$Sirens only sound for fires$t$, $t$Sirens are always late$t$], 0, $t$Sirens are an outdoor warning system. Inside, use a weather radio and phone alerts.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 3, $t$Where to shelter$t$, $t$In a tornado, the goal is to put as many walls as possible between people and the outside, on the lowest floor.
The best shelter areas in a church building are usually:
- Interior hallways on the lowest floor, away from doors and windows.
- Interior restrooms, closets, and small rooms without windows.
- A basement or storm shelter, if the building has one.
Avoid these areas:
- The sanctuary, gym, and fellowship hall. Large rooms with wide, open roofs are more likely to collapse in high winds.
- Rooms with lots of windows or glass doors.
- Vehicles. Cars offer very little protection, and driving away in a crowd causes traffic jams in the storm's path.
MRBC's plan should name specific shelter areas for every part of the building, with enough space for a full Sunday crowd. Walk those areas so you know how many people they hold.
The short video below from the National Weather Service explains how to choose a safe place.$t$, $t$https://www.youtube.com/watch?v=_5TiTfuvotc$t$, $t$A tornado warning is issued. Where do you send people from the sanctuary?$t$, array[$t$Out to their cars$t$, $t$Stay in the pews and duck$t$, $t$Interior rooms and hallways on the lowest floor, away from windows$t$], 2, $t$Large rooms with wide roofs are dangerous in high winds. Interior spaces on the lowest floor are safest.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 4, $t$Moving people to shelter$t$, $t$When a warning is issued, the team may have only minutes. A plan that's been practiced makes the move fast and calm.
- The team lead calls the shelter order on the radio and asks the pastor or worship leader to stop the service.
- The person at the front gives a short, calm instruction: "A tornado warning has been issued. Please follow the ushers to the hallways now. Leave your things."
- Each team member and usher leads their section to its assigned shelter area by the planned route.
- Children's teachers take their classes and rosters straight to the children's shelter area. Parents should be told that children are already sheltering, so they don't go against the flow looking for them.
- Assign helpers to anyone who moves slowly or uses a wheelchair.
- Close doors behind you as you go.
Calm voices are contagious. Speak slowly, keep people walking, and reassure them that they're heading somewhere safe.$t$, null, $t$Everyone heads for the same hallway at once. How could you have prevented the jam?$t$, array[$t$Assign each section its own route and shelter area ahead of time$t$, $t$Let people go wherever they want$t$, $t$Use only the main doors$t$], 0, $t$Planned routes for each section keep hallways moving when seconds count.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 5, $t$Inside the shelter$t$, $t$Once people are in place, help them protect themselves.
- Have people crouch low, facing an interior wall, with their heads down and hands covering the back of their neck.
- Use cushions, coats, or hymnals to protect heads if available. Bike or sports helmets help if anyone has them.
- Keep children close to their teachers or parents, with the smallest children nearest the wall and adults around them.
- Keep people away from doors at the ends of hallways.
- Get a count. Teachers check rosters, and team members ask their sections whether anyone is missing.
The team lead keeps monitoring the weather and gives updates. Regular, calm information prevents people from wandering off to look outside.
Stay sheltered until the warning expires or is canceled, not just when the wind dies down. Storms can produce more than one tornado, and the calm can be the space between them.$t$, null, $t$The wind has died down but the warning hasn't expired. A man wants to go check his car. What do you say?$t$, array[$t$"Take a teammate with you."$t$, $t$"Please stay here until the warning ends. The storm may not be finished."$t$, $t$"Sure, it looks clear now."$t$], 1, $t$The calm isn't always the end. Stay sheltered until the warning is over.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 6, $t$After the storm passes$t$, $t$When the warning ends, don't rush everyone back in. Check first.
- Care for anyone who was injured, and call 911 if needed.
- Check for hazards before people leave the shelter: smell of gas, sparking wires, broken glass, damaged ceilings, and water leaks.
- If the building is damaged, keep people out of those areas and evacuate if needed.
- Outside, look for downed power lines, fallen trees, and debris in the parking lot before releasing people to their cars. Treat every downed line as live.
- If there's significant damage in the area, roads may be blocked. Families may need to stay at church for a while.
Report damage to the church's leadership and facilities team, and file an incident report. Take photos for insurance once it's safe.
The church may also become a place where the community gathers after a disaster. Leadership may decide to open it as a shelter or relief center, and the team may help with that.$t$, null, $t$The warning has expired. Before people go back to the sanctuary, what do you check?$t$, array[$t$Injuries, gas smells, downed lines and building damage$t$, $t$Whether the coffee is still hot$t$, $t$Nothing, the storm is over$t$], 0, $t$Hazards after a storm can hurt people who leave shelter too quickly.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 7, $t$Lightning$t$, $t$Lightning kills people every year in the United States, and most victims are outdoors when it strikes. If you can hear thunder, you're close enough to be struck.
The National Weather Service's rule is simple: when thunder roars, go indoors. For outdoor church events, such as picnics, sports, baptisms in a lake, or parking lot ministries:
- Assign someone to watch the sky and check radar during the event.
- At the first sound of thunder, move everyone inside a building or into hard-topped vehicles with windows closed.
- Wait at least thirty minutes after the last thunder before going back outside.
- Open shelters like pavilions, tents, and dugouts don't protect against lightning.
- Stay away from water, tall isolated trees, and metal fences.
Indoors, stay off corded phones and away from plumbing and electrical equipment during a storm.
If someone is struck by lightning, they don't carry an electrical charge and are safe to touch. Call 911 and start CPR if they aren't breathing normally.$t$, null, $t$At the church picnic, you hear distant thunder but the sky overhead is still blue. What should happen?$t$, array[$t$Move people under the picnic pavilion$t$, $t$Keep going until it starts raining$t$, $t$Move everyone indoors or into hard-topped cars right away$t$], 2, $t$If you can hear thunder, you can be struck. Pavilions don't protect against lightning.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 8, $t$Flash flooding$t$, $t$Flooding is one of the deadliest weather hazards, and most flood deaths happen in vehicles. Heavy rain can turn streets, parking lots, and low-water crossings into dangerous currents in minutes.
- Six inches of moving water can knock an adult off their feet.
- About a foot of moving water can float many cars, and two feet can carry away most vehicles, including trucks.
- Water hides washed-out roads and holes underneath.
The rule is: turn around, don't drown.
For the team:
- During a flash flood warning, encourage people to wait at church rather than drive through flooded areas.
- Know if any part of the parking lot or nearby roads floods easily, and block those areas off before the service ends.
- Never let people walk or drive through moving water to reach their cars.
- If water is entering the building, move people to higher areas and turn off electricity to flooded areas only if it's safe to reach the panel without touching water.$t$, null, $t$A family wants to drive home through a flooded road near the church. What's your advice?$t$, array[$t$Wait at church until the water goes down, since even shallow moving water can carry a car$t$, $t$Drive fast to get through quickly$t$, $t$It's fine if the water looks shallow$t$], 0, $t$Water depth and road damage are hard to judge. Turn around, don't drown.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 9, $t$Heat and outdoor events$t$, $t$Extreme heat is the leading weather-related cause of death in the United States, ahead of tornadoes and floods. Church events like vacation Bible school, outdoor services, and parking lot ministries can put people at risk.
Plan ahead:
- Check the heat index, not just the temperature. Humidity makes heat more dangerous.
- Schedule outdoor activities in the morning or evening, and shorten them on hot days.
- Provide shade, cool water, and an air-conditioned place to rest.
- Build in water breaks for children and volunteers, and make sure everyone drinks before they feel thirsty.
- Watch people who are most at risk: young children, older adults, people with heart conditions, and people working hard, like volunteers setting up.
- Never leave anyone, including children or pets, in a parked car, even for a few minutes. Temperatures inside a car can climb dangerously fast.
If the building loses air conditioning during a hot service, consider moving to a cooler space or ending early.
The Medical Emergencies class covers how to recognize and treat heat exhaustion and heat stroke.$t$, null, $t$It's a hot, humid day and the children's outdoor games are scheduled for 2 p.m. What would help most?$t$, array[$t$Keep the schedule and hand out water$t$, $t$Cancel all future outdoor events$t$, $t$Move the games to the morning or indoors, and plan water and shade breaks$t$], 2, $t$Timing, shade and water breaks prevent most heat illness. Plan around the hottest part of the day.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 10, $t$Winter weather$t$, $t$Ice and snow bring their own risks.
- **Slips and falls:** salt and clear sidewalks, steps, and entrances before people arrive, and keep checking during the event. Put mats inside entrances. Falls are among the most common injuries at churches in winter.
- **Cancellations:** church leadership should decide early whether to cancel or delay, and announce it through the church's usual channels. Better to cancel than to have older members driving on ice.
- **Carbon monoxide:** generators, gas heaters, and blocked vents can produce this odorless, deadly gas. Never run generators indoors or near open doors. Make sure carbon monoxide detectors are installed and working. Headache, dizziness, and nausea in several people at once can be a warning sign. Get everyone into fresh air and call 911.
- **Frozen pipes:** keep the building heated to a safe minimum when empty, and report leaks quickly.
- **Stranded people:** in a sudden storm, people may need to stay at church until roads clear. Know where blankets, water, and snacks are kept.$t$, null, $t$Several people in the fellowship hall complain of headaches and dizziness while a gas heater runs. What do you suspect and do?$t$, array[$t$They're tired, so let them rest$t$, $t$Turn the heater up to warm the room$t$, $t$Possible carbon monoxide. Get everyone into fresh air and call 911$t$], 2, $t$Carbon monoxide is odorless. Symptoms in several people at once mean get to fresh air and call for help.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 11, $t$Power outages$t$, $t$Storms often knock out power. A sudden blackout in a full sanctuary can cause confusion and falls.
- Emergency lights and lit exit signs should come on automatically. Test them regularly, and report any that don't work.
- Team members should carry a small flashlight on post.
- When power goes out, the team lead should ask the congregation to stay seated while the team assesses. Calm instructions prevent people from stumbling in the dark.
- If the outage lasts, decide whether to continue with natural light, move to a brighter space, or end the service.
- Check elevators for anyone trapped, and call for service if needed.
- Children's areas need flashlights and a calm adult. Teachers keep children together until they're picked up.
- Fire alarms and door locks may behave differently on backup power. Know how MRBC's systems work during an outage.
When power returns, check that alarms, locks, and refrigerators are working again.$t$, null, $t$The power goes out during the sermon. What should the team lead ask the congregation to do first?$t$, array[$t$Stay seated while the team checks the situation$t$, $t$Use their phones to call the power company$t$, $t$Leave the building right away$t$], 0, $t$Moving in the dark causes falls. Staying put while the team assesses keeps people safe.$t$),
  ('678301e7-1917-4814-b449-ac250c93bab9', 12, $t$Planning ahead$t$, $t$Weather emergencies go better when the decisions are made before the storm.
MRBC's weather plan should cover:
- Who monitors the weather and who decides to shelter, delay, or cancel.
- Shelter areas for every part of the building, and the route each section takes.
- How children's classes shelter and how parents are reunited afterward.
- Where weather radios, flashlights, first aid kits, and emergency supplies are kept.
- How to communicate cancellations to the congregation.
Practice the plan. A tornado drill once or twice a year, including the children's ministry, shows how long it takes and where people get stuck. Many states hold a statewide severe weather awareness week each spring that's a good time to drill.
Before every service on a day with a watch, walk your shelter route, check that the weather radio is on, and confirm who has which job.$t$, null, $t$When is the best time to practice a tornado drill?$t$, array[$t$Only when a watch has been issued$t$, $t$Never, since it frightens children$t$, $t$Once or twice a year, including the children's ministry$t$], 2, $t$Regular drills show how long sheltering takes and where people get stuck, before it matters.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 1, $t$What does a tornado warning mean?$t$, array[$t$A tornado happened yesterday$t$, $t$Conditions are right for tornadoes$t$, $t$A tornado has been spotted or detected and you should take shelter now$t$, $t$The storm is moving away$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 2, $t$Which is the best alert source inside a full sanctuary?$t$, array[$t$Outdoor sirens$t$, $t$Waiting for someone to call$t$, $t$Looking out the windows$t$, $t$A NOAA Weather Radio$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 3, $t$Why are large rooms like the sanctuary dangerous in a tornado?$t$, array[$t$They're too far from the parking lot$t$, $t$They're too crowded$t$, $t$They have too many exits$t$, $t$Wide, open roofs are more likely to collapse$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 4, $t$What position should people take in a tornado shelter area?$t$, array[$t$Crouching low, facing an interior wall, covering the back of the neck$t$, $t$Lying in the middle of the room$t$, $t$Sitting by a window to watch$t$, $t$Standing near the door$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 5, $t$When should people leave the tornado shelter?$t$, array[$t$When the warning expires or is canceled and hazards are checked$t$, $t$When the wind dies down$t$, $t$After fifteen minutes$t$, $t$When the power comes back$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 6, $t$How long should you wait after the last thunder before going back outside?$t$, array[$t$Five minutes$t$, $t$Until the rain stops$t$, $t$Thirty minutes$t$, $t$Ten minutes$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 7, $t$How much moving water can knock an adult off their feet?$t$, array[$t$Three feet$t$, $t$Six inches$t$, $t$Two feet$t$, $t$One inch$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 8, $t$What is the leading weather-related cause of death in the United States?$t$, array[$t$Extreme heat$t$, $t$Tornadoes$t$, $t$Hail$t$, $t$Lightning$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 9, $t$Where should a generator never be run?$t$, array[$t$In a parking lot$t$, $t$Far from the building$t$, $t$Indoors or near open doors$t$, $t$Outdoors, away from windows$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('678301e7-1917-4814-b449-ac250c93bab9', 10, $t$What should team members carry on post in case of a power outage?$t$, array[$t$A small flashlight$t$, $t$Extra batteries for the sound system$t$, $t$Candles$t$, $t$A generator$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
update public.training_classes set minutes = 28 where id = '678301e7-1917-4814-b449-ac250c93bab9';

-- Class 9
delete from public.training_progress where class_id = 'ef82d3b2-43b7-483d-a05c-cc148b067912';
delete from public.training_lessons where class_id = 'ef82d3b2-43b7-483d-a05c-cc148b067912';
delete from public.training_questions where class_id = 'ef82d3b2-43b7-483d-a05c-cc148b067912';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 1, $t$Why communication decides outcomes$t$, $t$When emergency responders review what went wrong in a major incident, communication problems show up again and again. People didn't know what others had seen, messages were unclear, or nobody was sure who was in charge.
For a church safety team, good communication is what turns individuals on separate posts into one team. A greeter who notices something at the front door can alert the person at the children's wing in seconds. The team lead can see the whole picture and direct the response.
This class covers two kinds of communication:
- **Live communication** during services, mainly by radio, so the team can act together in the moment.
- **Written reports** after an incident, so the church has an accurate record and can learn from what happened.
Both depend on the same habits: say what matters, say it clearly, and stick to the facts.
Communication is also a skill that fades without practice. Using the radio for routine things, like radio checks and position updates, keeps everyone comfortable for the day it really counts.$t$, null, $t$Why should the team use radios for routine things like position updates?$t$, array[$t$Radios don't need practice$t$, $t$To fill silence during the service$t$, $t$So everyone stays comfortable with the radio for when it really matters$t$], 2, $t$Routine use builds habits, so radio skills hold up under stress.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 2, $t$Your radio$t$, $t$Before each service, take a minute to make sure your radio is ready.
- **Battery:** start with a fully charged battery. Carry a spare or know where the charging station is.
- **Channel:** confirm you're on the team's assigned channel. A radio on the wrong channel is the same as no radio.
- **Volume:** loud enough to hear in a noisy lobby, but not so loud it carries across a quiet sanctuary.
- **Earpiece:** use an earpiece whenever you can. It keeps radio traffic private and lets you hear during loud worship.
- **Radio check:** check in with the team lead at the start of your shift. "Team Lead, Parking, radio check." The lead answers, "Parking, loud and clear."
Learn your radio's controls by feel, so you can find the talk button and volume without looking. Under stress, fine motor skills drop and fumbling is common.
At the end of your shift, return your radio to the charger so it's ready next time. Report any radio that won't hold a charge or has a broken earpiece.$t$, null, $t$You turn on your radio before the service and hear nothing at all. What should you check first?$t$, array[$t$Nothing, since it's probably a quiet morning$t$, $t$Whether the battery is fully charged and you're on the right channel$t$, $t$Whether the pastor has started$t$], 1, $t$A dead battery or wrong channel is the most common reason a radio is silent. Check both, then do a radio check.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 3, $t$Radio etiquette$t$, $t$Only one person can talk on a channel at a time. When two people press the button at once, both messages are usually lost. Good habits keep the channel clear.
- **Listen first.** Before you talk, make sure nobody else is speaking.
- **Press, pause, speak.** Press the talk button and wait about a second before speaking, so your first words aren't cut off.
- **Think before you speak.** Know what you want to say before you press the button.
- **Keep it short.** Long messages tie up the channel. If you have a lot to say, break it into short pieces or ask the person to meet you.
- **Speak clearly** at a normal volume, with the radio a few inches from your mouth.
- **Release the button** when you're done. A stuck button blocks everyone.
Avoid casual chatter on the team channel. If you need a personal conversation, use your phone or talk in person.$t$, null, $t$Someone else is mid-sentence on the radio. What do you do?$t$, array[$t$Switch channels$t$, $t$Talk over them, since yours is important$t$, $t$Wait until they finish, then press, pause and speak$t$], 2, $t$Listen before you talk. Two people transmitting at once means nobody gets heard.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 4, $t$The call format$t$, $t$A standard format means listeners always know who is talking and who the message is for.
Start with **who you're calling**, then **who you are**: "Team Lead, Lobby." Wait for them to answer: "Lobby, go ahead." Then give your message.
For urgent messages, skip the wait and give the message right away: "Team Lead, Lobby. Need a medic at the east doors now."
Use your post or role, not your name. If someone switches posts, the call sign stays with the post, and listeners always know where a speaker is.
Confirm messages you receive. Say "copy" to show you heard and understood, or repeat back key details for important instructions. "Copy, sending medic to east doors."
If you didn't understand, say "say again" rather than guessing.
Close the loop when a task is finished. "Team Lead, Lobby. Medic is with the patient." Without that, the team lead doesn't know whether help arrived.$t$, null, $t$Which radio call is best when someone faints?$t$, array[$t$"Team Lead, Lobby. Need a medic at the east doors."$t$, $t$"Help! Emergency!"$t$, $t$"Mrs. Jones just passed out, I think it's her heart!"$t$], 0, $t$Who you're calling, who you are, and what you need, with no names or diagnoses others might overhear.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 5, $t$Plain language$t$, $t$Many people grew up hearing ten-codes on police shows, like "ten-four." The national incident management guidance from FEMA recommends plain language instead, because codes mean different things to different agencies and are easily forgotten under stress.
At MRBC, say what you mean in simple words: "Need a medic," "Suspicious person at the side door," "All clear."
A few standard words are still useful because they're short and clear:
- **Copy:** I heard and understood.
- **Say again:** please repeat.
- **Stand by:** wait, I'll get back to you.
- **Go ahead:** I'm listening.
- **Disregard:** ignore my last message.
The team may also agree on a small number of discreet phrases for situations where plain words could alarm people who overhear, such as a known person of concern arriving. Keep that list short, write it down, and practice it. A code nobody remembers in an emergency is worse than no code at all.
In a true emergency where the congregation must act, like evacuating, plain words to the room always come first.$t$, null, $t$Why does FEMA recommend plain language instead of codes on the radio?$t$, array[$t$Codes take too long to say$t$, $t$Codes are easily forgotten under stress and mean different things to different people$t$, $t$Plain language is required by law$t$], 1, $t$Plain words work for everyone, even under stress. Keep any discreet codes few and practiced.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 6, $t$Describing locations$t$, $t$A message is only useful if teammates can find the place you're talking about. "Over here" or "by the door" doesn't help when the building has dozens of doors.
- Use the agreed names for every area and entrance, like "east doors," "nursery hallway," "gym lobby," or "north lot." Those names should be posted on a building map and taught to every team member.
- Give the most specific location you can: "Second row from the back, left side of the sanctuary."
- In the parking lot, use landmarks, rows, or sections, and include vehicle descriptions: "Silver pickup, north lot, third row near the light pole."
- Some teams use clock positions in the sanctuary, with twelve o'clock at the platform.
- When someone is moving, give the direction: "Heading toward the gym."
New team members should walk the building with an experienced member and learn every name before serving alone. Visitors from other teams or police may not know the names, so use landmarks when talking to them.$t$, null, $t$Which location description helps teammates the most?$t$, array[$t$"He's over by the door."$t$, $t$"He's at the east doors, just inside, next to the coat rack."$t$, $t$"He's somewhere in the building."$t$], 1, $t$Specific, agreed names and landmarks let teammates find the place fast.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 7, $t$Emergency traffic$t$, $t$When something serious is happening, the channel has to belong to the people handling it.
If you have an urgent message and the channel is busy, use the agreed phrase for priority, such as "Emergency traffic." Everyone else stops transmitting and listens.
Once emergency traffic is declared:
- Only the team lead and people directly involved in the response use the channel.
- Everyone else stays quiet unless they have information the response needs, such as seeing the suspect or the injured person.
- Don't ask what's happening. The team lead will share what you need to know.
- Stay on your post unless you're directed to move. A post left empty can become the next gap.
When the situation is resolved, the team lead announces that normal traffic can resume, often by saying "Resume normal traffic" or "All clear."
If the team lead is involved in the incident, they may hand control of the channel to someone else. Listen for that handoff.$t$, null, $t$Emergency traffic has been called for a medical incident in the gym. You're on the parking lot post and curious. What do you do?$t$, array[$t$Stay quiet, stay on your post, and listen$t$, $t$Ask on the radio what's happening$t$, $t$Walk to the gym to help$t$], 0, $t$Keep the channel clear for the response and keep your post covered. The team lead will share what you need.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 8, $t$Who might be listening$t$, $t$Radio signals don't stay inside the building. Scanners, other radios on the same channel, and anyone standing next to you without an earpiece can hear team traffic.
Protect privacy on the radio:
- Don't use names of members or visitors when a description will work.
- Don't share medical details or guesses, like "I think she's diabetic" or "he's having a heart attack." Say what you need: "Need a medic."
- Don't discuss personal situations, such as custody disputes or protective orders, on the radio. Use a phone or talk in person.
- Use an earpiece so congregation members near you don't hear radio traffic.
- Watch your tone and words. Assume anything you say could be repeated.
If you need to share sensitive information with the team lead, ask them to call you or meet you: "Team Lead, Lobby. Can you call me?"$t$, null, $t$You need to tell the team lead that a man under a protective order is in the parking lot. How should you pass along the details?$t$, array[$t$Say his name and the details on the radio$t$, $t$Wait until after the service$t$, $t$Ask the team lead to call you or meet in person for the sensitive details$t$], 2, $t$Radio traffic can be overheard. Use a phone or in-person conversation for sensitive details.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 9, $t$When the radios fail$t$, $t$Radios can fail. Batteries die, buildings block signals, and too many people talk at once. Every team needs a backup plan.
- **Cell phones:** know the team lead's number by heart or have it saved. A team group text works for non-urgent updates.
- **Runners:** a teammate can carry a message in person, which is slow but reliable.
- **Hand signals:** agree on a few simple ones for use across a room, like a raised hand for "I need help" or a thumbs up for "all good."
- **Fixed meeting points:** if communication breaks down completely, team members go to a set location to regroup with the team lead.
- **Phones for 911:** never rely on the radio to reach emergency services. Radios usually aren't connected to police or fire dispatch.
Some areas of the building may have weak radio signals, such as basements or rooms with thick walls. Learn where they are, and plan another way to communicate from those spots.$t$, null, $t$Your radio isn't reaching the team lead from the basement shelter area. What's a good backup?$t$, array[$t$Call or text the team lead, or send a runner$t$, $t$Keep trying the radio every few seconds$t$, $t$Wait until you go back upstairs$t$], 0, $t$Radios have dead spots. Phones and runners keep the message moving.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 10, $t$Handing off to responders$t$, $t$When police, firefighters, or medics arrive, the team's communication shifts to helping them work quickly.
- **Meet them at the door.** Send a team member to the entrance you gave the dispatcher, and have them lead responders straight to the scene. Responders lose valuable time searching an unfamiliar building.
- **Give a short summary.** What happened, when it started, what's been done, and what's still going on. For a medical call: "Sixty-year-old man collapsed at ten forty. Not breathing. CPR started right away, AED gave one shock."
- **Point out hazards and people.** Where the threat was last seen, who is still inside, and which areas haven't been checked.
- **Follow their direction.** Once responders arrive, they're in charge of the scene. The team supports them.
- **Have information ready.** The team lead should know the building layout, how to reach the person who has keys, and the location of utility shutoffs.
Afterward, officers may ask for statements. Tell what you saw and heard in plain facts, the same way you'd write a report. Let the team lead know if you've given a statement.$t$, null, $t$Paramedics arrive at the front entrance for a man who collapsed in the fellowship hall. What helps them most?$t$, array[$t$Telling them the room number and letting them find it$t$, $t$Waiting for the pastor to greet them$t$, $t$A team member meets them at the door, leads them in, and gives a short summary$t$], 2, $t$Meeting responders and giving a quick summary saves time they'd otherwise spend searching and asking.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 11, $t$Why reports matter$t$, $t$Every incident, even a small one, deserves a written report. Reports serve several purposes:
- **Patterns:** a single report of someone trying car doors may seem minor. Three reports over a month show a pattern the team can act on.
- **Follow-up:** reports make sure injured people are checked on, damaged equipment is fixed, and concerns reach the right leaders.
- **Legal protection:** if an incident leads to an insurance claim or lawsuit months later, a clear report written at the time is far more reliable than anyone's memory.
- **Learning:** reports help the team see what worked and what needs to change.
Report medical calls, injuries, disruptive people, suspicious activity, property damage, theft, child safety concerns, and anything that required the team to respond. When in doubt, write it up.
File your report in the app the same day, while details are fresh. Memory fades quickly, especially after a stressful event.$t$, null, $t$A visitor tripped on the steps but says they're fine. Do you file a report?$t$, array[$t$No, nobody got hurt$t$, $t$Yes, file it in the app the same day$t$, $t$Only if they ask you to$t$], 1, $t$Small incidents still matter. Reports show patterns and protect everyone if questions come up later.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 12, $t$What goes in a report$t$, $t$A good report lets someone who wasn't there understand exactly what happened.
Include:
- **When:** date and time the incident started and ended.
- **Where:** the specific location, using the building's names.
- **Who:** people involved, witnesses, and team members who responded. Include descriptions for people you don't know.
- **What happened:** events in the order they occurred.
- **What you did:** the actions taken, and by whom.
- **Outcome:** how it ended. Was 911 called? Did EMS transport anyone? Did someone leave?
- **Follow-up needed:** anything still open, like a damaged door or a family to check on.
Write in short, clear sentences in the first person: "I saw," "I heard," "I asked." Use exact times when you know them, and say when a time is approximate.
Attach photos if they help, such as damage or a hazard, but don't photograph injured people or children.$t$, null, $t$Which detail should NOT go in an incident report?$t$, array[$t$The time the incident started$t$, $t$A photo of the injured child$t$, $t$What the team did in response$t$], 1, $t$Photos of damage or hazards can help, but injured people and children shouldn't be photographed.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 13, $t$Facts, not opinions$t$, $t$The most common weakness in reports is opinion presented as fact. Opinions and guesses can be wrong, and in a legal setting they can make the whole report look unreliable.
Compare these:
- Opinion: "He was drunk." Fact: "He smelled of alcohol, slurred his words, and stumbled twice."
- Opinion: "She was being aggressive." Fact: "She yelled, pointed at the greeter, and stepped within a foot of her face."
- Opinion: "He was clearly a troublemaker." Fact: "He walked the hallways for twenty minutes without entering a room."
Quote people's exact words when they matter, using quotation marks. "He said, 'You can't make me leave.'"
Avoid labels and diagnoses, like "mentally ill," "on drugs," or "crazy." Describe the behavior and let others draw conclusions.
If you didn't see something yourself, say who told you. "The greeter told me she saw him take the purse."$t$, null, $t$Which sentence belongs in an incident report?$t$, array[$t$"He was obviously drunk."$t$, $t$"He said, 'You can't make me leave,' and walked toward the stage."$t$, $t$"She seemed like a troublemaker."$t$], 1, $t$Stick to what you saw and heard. Quote people and leave out guesses about motives or conditions.$t$),
  ('ef82d3b2-43b7-483d-a05c-cc148b067912', 14, $t$Keeping reports private$t$, $t$Incident reports contain sensitive information about real people: medical events, family conflicts, and accusations. Handle them carefully.
- File reports only in the app, where access is limited to the people who need them. Don't keep copies in personal email, texts, or notes on your phone.
- Don't share reports or their contents with people outside the team and church leadership.
- If a member asks to see a report about them, refer them to the team lead or pastor.
- If police, an insurance company, or an attorney asks for a report, refer them to church leadership. Don't hand over records yourself.
- Don't edit a report after it's filed to change what happened. If you remember something new, add it as a clearly dated addition.
Child safety concerns may also need to go to state authorities, as covered in the Child Protection class. Filing an internal report doesn't replace that legal duty.$t$, null, $t$An attorney calls asking for a copy of your incident report. What do you do?$t$, array[$t$Tell them what you remember$t$, $t$Refer them to church leadership$t$, $t$Email them the report$t$], 1, $t$Requests for records go through leadership, who can handle them properly.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 1, $t$What should you do before the service with your radio?$t$, array[$t$Lend it to a greeter$t$, $t$Change to your favorite channel$t$, $t$Check the battery, channel, and volume, and do a radio check$t$, $t$Turn it off to save battery$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 2, $t$What does "press, pause, speak" prevent?$t$, array[$t$Other people hearing you$t$, $t$Cutting off your first words$t$, $t$Feedback noise$t$, $t$Battery drain$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 3, $t$What comes first in a radio call?$t$, array[$t$Who you're calling$t$, $t$The message$t$, $t$The time$t$, $t$Your name$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 4, $t$What does "copy" mean?$t$, array[$t$Please repeat$t$, $t$Wait$t$, $t$Ignore my last message$t$, $t$I heard and understood$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 5, $t$Why should team members use post names instead of personal names?$t$, array[$t$Names are too long$t$, $t$The call sign stays with the post, so listeners know where the speaker is$t$, $t$Nobody knows each other's names$t$, $t$It's more formal$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 6, $t$What should other team members do during emergency traffic?$t$, array[$t$Leave their posts to help$t$, $t$Stay quiet, stay on post, and listen$t$, $t$Ask for updates$t$, $t$Switch channels$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 7, $t$Which should you avoid saying on the radio?$t$, array[$t$"All clear."$t$, $t$"I think Mrs. Smith is having a heart attack."$t$, $t$"Copy."$t$, $t$"Need a medic at the east doors."$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 8, $t$What's the best backup when radios fail?$t$, array[$t$Phones, runners, and agreed meeting points$t$, $t$Using the church sound system$t$, $t$Waiting until the radios work$t$, $t$Shouting across the building$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 9, $t$When should an incident report be filed?$t$, array[$t$At the end of the month$t$, $t$Only if the team lead asks$t$, $t$Only if someone was injured$t$, $t$The same day, while details are fresh$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 3 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('ef82d3b2-43b7-483d-a05c-cc148b067912', 10, $t$Which statement is written as a fact rather than an opinion?$t$, array[$t$"She looked suspicious."$t$, $t$"He was obviously upset."$t$, $t$"He walked the hallways for twenty minutes without entering a room."$t$, $t$"He was being difficult."$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
update public.training_classes set minutes = 29 where id = 'ef82d3b2-43b7-483d-a05c-cc148b067912';

-- Class 10
delete from public.training_progress where class_id = '89fb1e88-4837-4912-a653-6912f996ee61';
delete from public.training_lessons where class_id = '89fb1e88-4837-4912-a653-6912f996ee61';
delete from public.training_questions where class_id = '89fb1e88-4837-4912-a653-6912f996ee61';
insert into public.training_lessons (class_id, position, title, body, video_url, check_prompt, check_choices, check_answer, check_explanation) values
  ('89fb1e88-4837-4912-a653-6912f996ee61', 1, $t$The front line$t$, $t$Greeters, ushers, and parking volunteers see every person who comes to MRBC. They are the first impression of the church and the first chance to notice a problem.
Those two jobs work together. A warm welcome is good hospitality, and it's also good security. When someone is greeted personally, they feel seen. Most people love that. A person with bad intentions usually doesn't, and that discomfort is often visible.
Front-line volunteers don't need to be security experts. Their role is to:
- Welcome every person warmly and help visitors find their way.
- Notice anything or anyone that seems out of place.
- Quietly pass concerns to the safety team, by radio or in person.
- Let the safety team handle any response.
The safety team supports greeters and ushers by training them, checking in with them before services, and responding quickly when they report something. Many teams invite greeters and ushers to safety briefings so everyone shares the same plan.$t$, null, $t$A greeter notices a visitor who seems very nervous and avoids eye contact. What should the greeter do?$t$, array[$t$Welcome them warmly and quietly let the safety team know$t$, $t$Ask them to leave$t$, $t$Follow them around the building$t$], 0, $t$Greeters report and the safety team responds. A warm welcome often eases nerves too.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 2, $t$The power of hello$t$, $t$The Cybersecurity and Infrastructure Security Agency's Power of Hello program teaches a simple approach for anyone who greets people. It follows four steps.
- **Observe:** pay attention to people's behavior as they arrive.
- **Initiate a hello:** greet the person. A simple "Good morning, welcome!" starts a conversation and lets you read their response.
- **Navigate the risk:** decide whether what you're seeing is normal or concerning. Most people respond naturally. Someone who avoids every question, gives answers that don't add up, or becomes agitated deserves a closer look.
- **Get help:** if something is concerning, tell the safety team. If it's an emergency, call 911.
A hello costs nothing and accomplishes a lot. It welcomes newcomers, connects people to the church, and lets anyone planning harm know they've been noticed.
Greet people at the door, in the parking lot, and in the hallways. A hello in the hallway is just as useful as one at the front entrance.$t$, null, $t$What's the main security benefit of greeting every person who arrives?$t$, array[$t$It lets you read their response and shows them they've been noticed$t$, $t$It slows people down at the door$t$, $t$It counts attendance$t$], 0, $t$A simple hello opens a conversation, and how people respond tells you a lot.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 3, $t$Controlling the doors$t$, $t$Every open door is a way in. The fewer doors in use, the easier it is to watch who enters.
- Decide before each service which doors will be open. Ideally, one or two main entrances are open and staffed, and the rest are locked from the outside.
- Every door that's open from the outside should have a greeter or team member watching it.
- Once the service is underway and arrivals slow down, the team lead may lock additional doors from the outside, leaving the main entrance staffed for latecomers.
- Locked doors must always open from the inside, so people can get out in an emergency.
- The children's wing should have its own controlled entrance, used only by parents dropping off or picking up, and watched at all times.
Door control isn't about keeping people out. Late arrivals, visitors, and people needing help are welcome. It's about making sure everyone who enters passes a friendly, watching face.$t$, null, $t$It's warm in the building. Is it OK to prop a side door open?$t$, array[$t$Only during the sermon$t$, $t$No. Keep doors closed and watched, and fix the airflow another way$t$, $t$Yes, if it's just for a few minutes$t$], 1, $t$A propped door bypasses the layer of security the team is watching.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 4, $t$Keys and access$t$, $t$Who can get into the building matters as much as which doors are open.
- Keep a list of everyone who has keys, key cards, or door codes. Review it at least once a year.
- When someone leaves a role, collect their keys or cancel their card. Change door codes when staff or volunteers leave.
- Limit master keys to a small number of people.
- Don't share door codes by text or post them where others can see.
- Don't lend your key to someone who isn't on the list, even if they're a member.
- Report lost keys right away, so locks can be changed if needed.
Watch for tailgating, when someone follows an authorized person through a secured door before it closes. It's natural to hold the door for people, especially at church, but secured doors like the children's wing or the office should only be opened for people who are expected.
If you find a door that should be locked but isn't, lock it if you can, check the area for anyone inside, and report it.$t$, null, $t$You badge into the office hallway and a man you don't know walks up behind you to follow you in. What do you do?$t$, array[$t$Greet him, ask who he's here to see, and help him from outside the secured door$t$, $t$Let the door close in his face without a word$t$, $t$Hold the door, since it's polite$t$], 0, $t$Being friendly and secure go together. Help him without letting him tailgate into a secured area.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 5, $t$Patrolling the parking lot$t$, $t$The parking lot is the outer layer of security, and it's where many church crimes happen. Car break-ins and thefts are common during services, when the lot is full and nobody is watching.
- Walk the lot regularly during services, varying your route and timing, so patrols aren't predictable.
- Watch for people walking between cars, looking into windows, or trying door handles.
- Note vehicles that circle the lot, park facing the building with someone inside, or park in odd places like fire lanes or by side doors.
- Watch the edges of the property, where people can approach without being seen.
- Report broken lights, overgrown bushes, and blind spots, since those give cover to anyone hiding.
- Encourage members to lock their cars and keep valuables out of sight.
Team members on parking duty should dress for the weather, carry a radio and flashlight, and stay visible. A visible patrol discourages most crimes before they happen.$t$, null, $t$You see someone walking the lot trying car door handles. What do you do?$t$, array[$t$Confront them right away$t$, $t$Note their description and direction and report it to the team lead$t$, $t$Ignore it, since it's not inside the building$t$], 1, $t$Watch, note details, and report. Let the team lead decide the response.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 6, $t$Vehicles and traffic$t$, $t$Parking lots mix moving cars and pedestrians, often in a hurry and in the dark. Most injuries in church lots are from vehicles and falls, not crime.
- Guide traffic with clear signals and bright vests or jackets, especially before and after services.
- Stand where drivers can see you, never directly in a car's path.
- Keep fire lanes and the area near entrances clear for emergency vehicles.
- Watch children closely. They're small, fast, and hard for drivers to see.
- Keep accessible parking spaces available and the paths from them clear.
- Encourage drivers to slow down, and report anyone driving recklessly.
Vehicles can also be used deliberately as weapons. Attacks using cars against crowds have happened at gatherings around the world. Watch for vehicles that speed toward crowds, enter pedestrian areas, or behave erratically. Large outdoor events may need barriers, like parked vehicles or planters, between traffic and people.
If a vehicle is moving toward people, shout a warning and get people out of its path. Then report it.$t$, null, $t$Before the service, a car is driving fast and swerving through the lot near families walking in. What do you do first?$t$, array[$t$Write down the license plate$t$, $t$Step in front of the car to stop it$t$, $t$Shout a warning to get people out of its path, then report it$t$], 2, $t$People's safety comes first. Warn them away from the vehicle, and never put yourself in its path.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 7, $t$Ushers in the sanctuary$t$, $t$Ushers are the safety team's eyes inside the sanctuary.
- Position ushers at the back and along the sides, where they can see the whole room and every door.
- Know your section. Notice who comes in, who leaves, and anyone who keeps moving around.
- Help people find seats, but don't block aisles with extra chairs.
- Watch for medical problems. People who look pale, sweaty, or unsteady may be about to faint.
- Keep an eye on the platform and the space in front of it, where a disruption would affect the most people.
- Be the first to respond to small needs, like a crying baby or a dropped glass, so the team can keep watching for bigger ones.
Ushers should know how to reach the safety team discreetly, where the AED and first aid kit are, and the evacuation routes for their section.
During prayer, many people close their eyes. Ushers and team members should keep theirs open.$t$, null, $t$Where should ushers stand during the service?$t$, array[$t$Outside in the lobby$t$, $t$In the front row, facing the pastor$t$, $t$At the back and sides, where they can see the room and the doors$t$], 2, $t$The back and sides give ushers a view of the whole room, every door, and the platform.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 8, $t$Disruptions during worship$t$, $t$Sometimes someone disrupts a service. It might be a person in distress, someone shouting, or someone walking toward the platform uninvited.
- The usher or team member nearest the person moves toward them calmly, without running.
- Approach from the side, introduce yourself by first name, and speak quietly: "Can I help you with something? Let's step out to the lobby."
- A second team member positions between the person and the platform, without confrontation.
- The pastor or worship leader should know the plan. Often the best response from the platform is to pause calmly or continue, as agreed with the team.
- Once in the lobby, continue the conversation using de-escalation skills.
Don't make a scene. Most disruptions end quickly and quietly when someone kind steps in. The congregation should notice as little as possible.
If the person shows any sign of violence, the response changes. Get people away from them and call 911.$t$, null, $t$A man stands up during the sermon and starts walking toward the platform, talking loudly. What's the best first move?$t$, array[$t$Shout at him to sit down$t$, $t$A team member calmly approaches from the side and invites him to step out, while another moves between him and the platform$t$, $t$Tackle him before he reaches the stage$t$], 1, $t$A calm approach and quiet positioning usually end a disruption without a scene.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 9, $t$Protecting the offering$t$, $t$Money attracts theft, and offering procedures protect both the money and the people who handle it.
- At least two unrelated adults handle the offering at every step: collecting, carrying, counting, and depositing.
- Move the offering to the counting room directly, without stops. Vary the route and timing if possible.
- Count in a room with the door closed and locked, out of sight of windows and hallways.
- Both counters sign the count sheet.
- Store money in a locked safe until it's deposited, and limit who knows the combination.
- Make bank deposits during daylight with two people, at varying times. Many churches now use online giving, which reduces cash on hand.
These rules aren't about suspicion. They protect volunteers from false accusations and protect the church from loss.
If someone tries to take the offering by force, don't fight over money. Give it up, get a good description, and report it.$t$, null, $t$The usher who counts the offering asks you to carry the bag to the office alone. What do you say?$t$, array[$t$Leave it on the table for later$t$, $t$Two unrelated people should handle it, so let's walk it together$t$, $t$Sure, it's quicker$t$], 1, $t$Two-person handling protects the money and the people handling it.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 10, $t$Protecting the pastor$t$, $t$Pastors are public figures. They stand in front of the congregation every week, their schedules are known, and they deal with people in crisis. Some threats against churches are aimed at them personally.
- Know where the pastor is before, during, and after the service.
- Have a team member near the platform during the service, positioned to see the pastor and the front rows.
- After the service, many people want to talk to the pastor. Keep a team member nearby, watching hands and behavior, without crowding.
- Plan the pastor's route to and from the platform and to their car.
- Pastoral staff should tell the team about any threats, angry phone calls, or difficult counseling situations that might follow them to church.
- During weekday counseling, others should be in the building, and the office door should have a window.
The goal isn't a bodyguard. It's simply making sure someone is always aware and close enough to help.$t$, null, $t$After the service, a man the pastor recently counseled waits at the front, visibly angry. What should the team do?$t$, array[$t$Ask the pastor to leave through the back immediately$t$, $t$Keep a team member close by, watching, while the pastor decides whether to talk$t$, $t$Ask the man to leave$t$], 1, $t$Awareness and quiet presence protect the pastor without escalating things or embarrassing anyone.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 11, $t$Weekday security$t$, $t$The safety team is usually on duty on Sundays, but the building is often open all week with only a few people inside.
- Keep exterior doors locked during weekday office hours. Use a doorbell, camera, or intercom so staff can see who's there before letting them in.
- Have visitors wait in a public area, not wander the building.
- Don't let anyone work alone in the building without someone knowing they're there and when they expect to leave.
- Ministry leaders using the building for evening events should know how to lock up, who to call, and where the first aid kit and AED are.
- Keep the church calendar off public social media when it reveals when the building is nearly empty.
Share simple habits with staff and volunteers: lock doors behind you, don't prop doors, and report anything unusual to the team lead, even midweek.$t$, null, $t$A stranger rings the office doorbell on a Tuesday asking to look around the building. What should staff do?$t$, array[$t$Ignore the doorbell$t$, $t$Let him in and leave him to wander$t$, $t$Greet him at the door, ask how they can help, and keep him in a public area$t$], 2, $t$Weekday staff are few. Controlled entry and keeping visitors in public areas protect everyone.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 12, $t$Cameras and lighting$t$, $t$Cameras and lights extend what the team can see, especially at entrances and in the parking lot.
- **Lighting:** bright, even light at every entrance, along walkways, and across the parking lot discourages crime and helps people avoid falls. Report burned-out bulbs right away.
- **Landscaping:** keep shrubs trimmed below about three feet and tree branches above about seven feet near buildings and walkways, so nobody can hide in them.
- **Camera placement:** cameras are most useful at entrances, the children's wing, the parking lot, the offering counting room, and the office. A camera that clearly shows faces at each entrance is worth more than many cameras showing wide, blurry views.
- **Watching live:** if the church has a monitor at the team lead's post, glance at it regularly, especially at doors that aren't staffed.
- **Recordings:** know how long recordings are kept and who can pull footage. After an incident, tell the team lead quickly, before the footage is recorded over.
Cameras don't replace people. They mostly help after the fact. A greeter at the door stops problems that a camera only records.$t$, null, $t$There was a car break-in during the service. What should you do about the camera footage?$t$, array[$t$Post the footage online to identify the thief$t$, $t$Tell the team lead right away so the footage can be saved before it's recorded over$t$, $t$Nothing, since police will handle it$t$], 1, $t$Footage is often overwritten within days. Save it quickly, and let leadership share it with police.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 13, $t$Big days and special events$t$, $t$Christmas, Easter, funerals, weddings, and community events change everything about the front line.
- **More people:** crowds may double, with many first-time guests. Schedule extra greeters, ushers, and parking volunteers.
- **Different baseline:** funerals bring grief and family tension, weddings bring outside vendors and guests, and community events bring people who may not know church customs.
- **Parking:** plan overflow parking and traffic flow ahead of time. For very large events, consider asking local police for traffic help.
- **Doors:** more doors may need to be open for crowds. Each open door still needs someone watching it.
- **Publicity:** events advertised to the public are also known to anyone planning harm. Stay sharp.
- **Briefing:** hold a short team briefing before each special event to review posts, shelter areas, and any known concerns, such as a family conflict at a funeral.
After a big event, gather feedback from the front-line volunteers. They see what worked and what didn't better than anyone.$t$, null, $t$MRBC is hosting a funeral for a well-known community member, with a family dispute known to the staff. What should the team do?$t$, array[$t$Treat it like a normal Sunday$t$, $t$Cancel the safety team, since it's a funeral$t$, $t$Hold a briefing, add volunteers, and make sure the team knows about the family situation$t$], 2, $t$Special events change the crowd and the risks. A briefing and extra staff keep the team ready.$t$),
  ('89fb1e88-4837-4912-a653-6912f996ee61', 14, $t$Locking up$t$, $t$The end of the day is when the building is most vulnerable. The last people out often assume someone else locked up.
MRBC should use a lock-up checklist for every event:
- Walk every room, restroom, and closet to be sure nobody is left inside, including children waiting for a ride.
- Check that every exterior door is closed and locked, and every window is shut.
- Turn off kitchen appliances, space heaters, and unneeded lights.
- Make sure the offering is in the safe or deposited.
- Set the alarm system, if the building has one.
- Leave exterior lights on for the parking lot.
- Walk to cars in pairs after dark.
The person locking up should report any problems found, like a broken lock or a door that won't latch, so it can be fixed before the next event.
Never leave a child at church alone waiting for a ride. Two adults should stay until a parent arrives.$t$, null, $t$While locking up after the evening Bible study, you find a ten-year-old waiting for a ride. What should happen?$t$, array[$t$One adult drives him home alone$t$, $t$Two adults stay with him until a parent arrives$t$, $t$Lock up and let him wait outside$t$], 1, $t$Children are never left alone, and the two-adult rule still applies after hours.$t$);
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 1, $t$What is the main role of greeters in security?$t$, array[$t$Removing disruptive people$t$, $t$Locking doors$t$, $t$Welcoming people, noticing what's out of place, and reporting concerns$t$, $t$Checking bags$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 2, $t$What are the four steps of CISA's Power of Hello?$t$, array[$t$Greet, check, search, seat$t$, $t$Observe, initiate a hello, navigate the risk, get help$t$, $t$Notice, confront, remove, report$t$, $t$Watch, wait, warn, wrap up$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 3, $t$Why limit the number of open entrances?$t$, array[$t$To make visitors feel unwelcome$t$, $t$Because of fire codes$t$, $t$So the team can watch everyone who enters$t$, $t$To save on heating$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 4, $t$What is tailgating?$t$, array[$t$Parking too close to the building$t$, $t$Following an authorized person through a secured door before it closes$t$, $t$Driving too fast in the lot$t$, $t$Leaving a car running$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 5, $t$Why should parking lot patrols vary their timing and route?$t$, array[$t$To get more exercise$t$, $t$Because of insurance rules$t$, $t$So patrols aren't predictable$t$, $t$To avoid traffic$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 6, $t$Where should you stand when guiding traffic?$t$, array[$t$Directly in front of moving cars$t$, $t$Where drivers can see you, never in a car's path$t$, $t$In the middle of the entrance$t$, $t$Behind parked cars$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 1 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 7, $t$What should ushers do during prayer?$t$, array[$t$Keep their eyes open and keep watching$t$, $t$Leave the sanctuary$t$, $t$Close their eyes with everyone$t$, $t$Count the offering$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 8, $t$How many people should handle the offering at every step?$t$, array[$t$At least two unrelated adults$t$, $t$Only the pastor$t$, $t$One trusted person$t$, $t$The whole usher team$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 9, $t$What should you do if someone tries to take the offering by force?$t$, array[$t$Give it up, get a description, and report it$t$, $t$Chase them to their car$t$, $t$Fight to protect it$t$, $t$Lock them in the counting room$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 0 from qn;
with qn as (insert into public.training_questions (class_id, position, prompt, choices) values ('89fb1e88-4837-4912-a653-6912f996ee61', 10, $t$What's the first step in locking up the building?$t$, array[$t$Leaving through the nearest door$t$, $t$Setting the alarm$t$, $t$Walking every room to make sure nobody is left inside$t$, $t$Turning off the parking lot lights$t$]) returning id)
insert into public.training_answers (question_id, correct_index) select id, 2 from qn;
update public.training_classes set minutes = 30 where id = '89fb1e88-4837-4912-a653-6912f996ee61';
