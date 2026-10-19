# SetMetric training evidence and design rules — v1.4

This document records the currently reviewed research that informed SetMetric's **starting templates**. It is **not** a claim that every exercise-science paper in existence has been read or that the app predicts personal biological response. The 2026 research landscape is evolving; conclusions must be revised as higher-quality evidence emerges.

## Design philosophy

1. **Simple for the user, explicit in the code.** We ask about the goal, experience, perceived strength and stamina, age, available time/equipment, sport workload, and preferred muscles. The app uses self-reports conservatively — these are *not* validated strength, VO2max, or medical assessments.
2. **All body parts is the default.** User can select all 10 groups or any subset. Fewer selected groups receive moderate additional priority, but the plan still includes movements for unselected major muscle groups to avoid imbalances. Selecting all never multiplies workload by 10.
3. **Consistency and recovery first.** Novices begin with 2 days; experienced users may train more based on schedule and other sports. Workload is distributed across sessions. A plan should be changed when exercise technique, sleep, soreness, injury, and performance indicate inadequate recovery.
4. **Evidence-informed rather than maximalist.** Strength requires heavier efforts and adequate rest; muscle growth is related to recoverable challenging volume with diminishing returns; fitness and fat-loss goals may include gradual cardio. Weight loss is not targeted to specific body regions.
5. **Respect special populations.** Youth programs need age-appropriate, supervised progression. Medical issues, pregnancy and injuries call for professional assessment; this app does not diagnose or prescribe rehabilitation.
6. **Never make every advanced technique the default.** Drop sets, supersets, rest-pause and repeated failure sets are optional tools for appropriate experienced users, *not guaranteed superior*.

## Sources and practical interpretation

- **ACSM 2026 position stand**: consistency, goal-specific prescriptions, ~10 weekly sets per muscle for hypertrophy as a reference point rather than a universal target; most complex techniques optional. https://www.acsm.org/wp-content/uploads/2026/03/Resistance-Training-Position-Stand-infographic.pdf
- **WHO 2020 activity guidelines**: adults aim to train all major muscle groups on two or more days each week; aerobic activity 150–300 moderate-intensity minutes/week or equivalent when feasible, built up gradually. https://www.ncbi.nlm.nih.gov/books/NBK566046/
- **2023 network meta-analysis of resistance-training prescription**: various approaches increase strength and hypertrophy vs no exercise; heavy loading most relevant for maximal strength. https://bjsm.bmj.com/content/57/18/1211
- **2025/26 resistance training dose-response review (67 studies)**: higher weekly sets generally improve hypertrophy with diminishing returns; more training frequency has different effects on strength vs hypertrophy. https://pubmed.ncbi.nlm.nih.gov/41343037/
- **2024 proximity-to-failure meta-regression**: being closer to failure may influence hypertrophy, but optimal threshold is uncertain; strength gains occurred at a range of proximity estimates. https://pubmed.ncbi.nlm.nih.gov/38970765/
- **2021 failure vs non-failure systematic review**: no clear advantage of always training to failure. https://pubmed.ncbi.nlm.nih.gov/33497853/
- **2024 rest-interval systematic review**: small possible hypertrophy benefit for rest periods greater than ~60 seconds; exact duration should allow good performance. https://pmc.ncbi.nlm.nih.gov/articles/PMC11349676/
- **2023 drop-set systematic review**: similar hypertrophy compared with traditional sets in a limited evidence base, and potentially greater time efficiency. Do not default to drop sets for beginners. https://link.springer.com/article/10.1186/s40798-023-00620-5
- **2024 concurrent endurance and strength meta-analysis**: sports workload should count toward recovery and session placement; possible lower-body-strength interference varies by context, and hypertrophy data were insufficient for a clear general conclusion. https://link.springer.com/article/10.1007/s40279-023-01943-9
- **2025 meta-analysis of resistance training during dietary weight loss**: resistance training helps preserve lean mass and may improve body fat loss when combined with dietary interventions. https://pubmed.ncbi.nlm.nih.gov/40909191/
- **2022 energy-deficit meta-analysis**: prolonged energy deficits can reduce gains in lean mass; aggressive dieting is not assumed appropriate by this app. https://pubmed.ncbi.nlm.nih.gov/34623696/
- **2018 protein and training meta-analysis**: adequate dietary protein supports training adaptations; this does not justify one-size-fits-all nutrition prescriptions without dietary and medical context. https://pubmed.ncbi.nlm.nih.gov/28698222/
- **NSCA youth training position statement**: children and adolescents need supervised, progressively instructed training and adequate recovery; avoid unqualified maximal testing. https://www.nsca.com/about-us/position-statements/youth-training-and-long-term-athletic-development/

## Training methods catalog (implemented status)

| Method | Audience | Status in v1.4 |
| --- | --- | --- |
| Basic resistance training, full-body and upper/lower splits | All appropriately screened participants | **Implemented** |
| Gradual load/rep progression | Beginner through advanced | **Implemented** using exercise log history |
| Compound/accessory selection, rest periods | All | **Implemented** with goal-adjusted ranges |
| Multiple weekly training-day configurations | All | **Implemented** with workload caps |
| Per-muscle priorities, including all 10 selected | All | **Implemented**; all selected means balanced |
| Easy/moderate supplementary cardio | Fitness, recomposition, fat loss | **Implemented** as optional schedule notes |
| Sport-specific advice by broad category | Athletes | **Partial**; cannot replace a sport coach |
| Different weekly volume blocks and deloading | Intermediate/advanced | **Not automated yet** |
| Supersets / antagonist supersets | Intermediate/advanced | **Guidance only; not scheduled automatically** |
| Drop sets, rest-pause, myo-reps | Advanced | **Not prescribed automatically** |
| Power/plyometric work, velocity-based training | Sport/power specialists | **Not prescribed automatically** |
| Blood-flow restriction training | Appropriate clinical/specialist context | **Not prescribed** |
| Personalized injury rehabilitation or disease-specific training | Qualified healthcare providers | **Not supported** |

## Known limitations

- These are starting templates, not medically cleared programs or physical capacity tests.
- The app currently does not calculate calorie intake, metabolic rate, body fat percentage, safe pregnancy programs, or diagnose any condition.
- A high number of exercise slots is not automatically productive; experienced athletes may prefer customized plans with a qualified coach.
- A user selecting all muscles still needs an appropriate number of weekly exercises and recovery, not an extreme "all muscles every day" regimen.
- 'Age' and 'gender' are recorded for user context; they are not used to stereotype strength capacity. Self-reported experience and health limitations influence the safer starting workload.
- No service continuously ingests newly published papers; future evidence reviews must be performed explicitly.
