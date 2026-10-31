# Book 2 plan: The Little Book of Everybody Says

Why, Dad? Defender, October 2026. This is a plan only. The game was not changed.

**In one line:** a second book of 8 new worlds and 40 new myths. It opens after Book 1's credits and has a new villain, Lady Hearsay, who never checks anything as long as "everybody says" it. Book 1's lesson was "being sure isn't being right". Book 2's lesson is "ask where it came from". It ends cleanly, and leaves a door open for Book 3.

---

## 1. Hook and story arc

### Why do the pages come back?

Book 1 ends with every page popped. Sir Ever-So-Sure says "I don't know", and the book turns gold. Book 2 must not undo that.

| Option | What happens | Verdict |
|---|---|---|
| **A. The overdue sequel** | A little book drops through the library's return slot, a hundred years overdue. It's the Big Book of Wrong's pocket-sized sister, and nobody ever checked it. | **Pick this.** Book 1 stays finished. A new book means new pages and a new villain. |
| B. Stuck pages | Some pages of the Big Book of Why were glued together and never got popped. | Weakens Book 1's "every page popped" ending. |
| C. Sir Ever-So-Sure turns bad again | He forgets his lesson and steals pages. | Undoes his redemption. A poor lesson for kids. |

### The villain: Lady Hearsay

- **Who she is:** the back cover of the little book. She's the blurb, made of stars and quotes: "Everybody says it's TRUE!" "My friend's cousin swears by it!"
- **Her flaw:** Sir Ever-So-Sure was *sure*. She doesn't care if she's right. She only cares whether everyone is saying it. "Hearsay" is a real word for something you heard but can't check.
- **Catchphrase:** "Everybody says so! Pass it on!" Her notes are signed "L.H."
- **Voice:** a new Gemini voice, code `h`. Direction: "a gossipy, theatrical cartoon auntie, breathless and funny, never scary".
- **Sir Ever-So-Sure comes back as a friend.** He's reformed and a little embarrassed. He knows her: "I used to be sure. She doesn't even care." He pops up once per chapter with a hint, and stays as the voice of "I don't know… yet".
- **In the arena:** like Sir Ever-So-Sure, she pins a note on the way in, scribbles the stage-3 rough draft stronger, and runs off with a page at the end. Her own move is **"Pass it on!"**: she whispers to two myths, and they turn into Gossips that jump on friends. Below 30% health she shouts "EVERYBODY SAYS SO!" and moves faster. This reuses the `gossip` kind and the `sses` borrowed-move pattern.

### How it ends

- **Showdown:** the Campfire Sun is her shield (like the Flat Earth was his).
- **The question:** the Kid asks "Where did you hear that?" She opens her mouth, then closes it. "I… I don't know. Somebody said it. I never checked."
- **The book changes:** it snaps shut and its cover turns silver. It's not the Little Book of Everybody Says any more. It's **The Little Book of How**. Sir Ever-So-Sure and Lady Hearsay end up side by side on the library shelf: the Book of Why and the Book of How.
- **Room for Book 3:** after the credits, a box in the library's lost property starts to rattle. It's optional and needs no promise.

### Story lines (voice codes as in the game: `n` narrator, `k` Kid, `d` Dad, `v` Sir Ever-So-Sure, `h` Lady Hearsay)

**Prologue** (in place of Book 1's `story_p1`…`p4`):
1. `n` Every book in the library had been checked. Every one but one: a little book that came back through the return slot, a hundred years overdue.
2. `n` It was the Little Book of Everybody Says. On its back cover lived Lady Hearsay. She never checked anything, as long as everybody was saying it.
3. `h` "Did you hear? Everybody says EVERYTHING in here is true! Pass it on!"
4. `n` She blew on the pages, and off they flew, whispering to each other all the way.
5. `v` "Oh dear. I know her. I used to be sure. She doesn't even care if she's right." `k` Then we'll check. Every page.
6. Title card: `<small>Book 2</small>The Little Book of Everybody Says`

**Showdown** (before Space Station 5): `h` "So you popped my pages. It doesn't matter. EVERYBODY says I'm right!" `k` Who's everybody? `h` "Everybody! My friend's cousin's hamster! Behold my shield: the biggest campfire in the sky!" `d` Pop the shield first. Then we ask her where she heard it.

**Ending:**
1. `k` Lady Hearsay… where did you hear all this? `n` Lady Hearsay opened her mouth. Then she closed it. `h` "I… I don't know. Somebody said it. I never checked."
2. `v` "Welcome to 'I don't know'. It's a lovely place to start."
3. `n` The little book snapped shut, and its cover turned silver. It wasn't the Little Book of Everybody Says any more. Big text: `<small>The</small>Little Book of How`
4. `h` "So… how DO we know the Earth goes round the Sun?" `d` Great question. Get your coat. We'll need a telescope. `n` The End. Well, the end of this book.

### The 8 worlds

Order: a day out that starts at home and ends in space. Each one hands off to the next, like Book 1.

| # | World | Desc (game style) | Myth family | Diary topics |
|---|---|---|---|---|
| 1 | 🍳 The Kitchen | Pots, pans, and a page that swears the microwave cooks from the middle. | Food and kitchen science | food, science |
| 2 | 🚜 The Farm | Cows, pigs and roosters, and a lot of things everybody's grandpa said. | Farm animals | animals |
| 3 | 🏛️ The Museum | Bones, statues and armour, and a dinosaur that says it's the very last one. | Dinosaurs and history | history, animals |
| 4 | 🏙️ The City | Towers, traffic and pigeons, and a skyscraper that swears it never wobbles. | Famous places, city science | history, science, words |
| 5 | 🏅 Sports Day | Ready, steady, wrong! Hearts, bones and a big yawn on the starting line. | Your amazing body | body |
| 6 | 🌦️ The Weather Station | Clouds, fog and forecasts, and a cloud that thinks it weighs nothing at all. | Weather | weather |
| 7 | ⛰️ The Mountains | Snowy peaks, fancy goats, and a mountain that swears it's the tallest. | Earth and rocks | earth, animals |
| 8 | 🛰️ The Space Station | Up past the sky, where stars don't twinkle and the Sun isn't a campfire. | Space, seen from up close | space |

**Comics** (same format as `WORLDS[].comic`; each `in` follows her pinned note):

**1. The Kitchen**
- Note: "Microwaves cook from the MIDDLE. My neighbour's cousin said so. L.H."
- in: `k` Dad, the kitchen is full of pages! One's in the honey jar! / `d` Kitchens are full of "everybody says". Salt this, microwave that. Let's check every one. / `k` I'll get the magnifying glass. You get the oven gloves.
- out: `k` The egg stood up! And it isn't even the first day of spring! / `d` Eggs don't read calendars. Now, the pages just blew out the back door, toward the farm. / `k` Then I'm bringing the egg. It's earned it.
- Flee: `h` "To the farm! Everybody knows what pigs are like!" `d` Everybody's about to learn something.

**2. The Farm**
- Note: "Pigs roll in mud because they're MESSY. Everybody says. L.H."
- in: `d` A farm. Every animal here has a story, and half the stories are wrong. / `k` That page says pigs roll in mud because they're messy. / `d` Pigs are very sensible, thank you. Pop it and see.
- out: `k` The cow has ONE tummy. With four rooms! / `d` Like a house for grass. Now look, the pages caught a bus into town. To the museum. / `k` A museum? Dinosaurs? DINOSAURS?
- Flee: `h` "To the museum! Old things are always right. Everybody says!" `d` Old things get checked too.

**3. The Museum**
- Note: "Knights needed a CRANE to get on their horses. I heard it on a tour. L.H."
- in: `k` Dad, a knight! Did he need a crane to get on his horse? / `d` Nope. Knights could run, climb and hop on. The crane is a joke someone told so often that people believed it. / `k` Then this museum has a LOT of jokes to pop.
- out: `k` Birds are dinosaurs. So the pigeons outside are dinosaurs? / `d` Tiny, feathery, very nosy dinosaurs. And the pages are flying with them, into the city. / `k` Follow the dinosaurs!
- Flee: `h` "To the big city! Everybody there says EVERYTHING!" `k` She's riding a pigeon!

**4. The City**
- Note: "The Eiffel Tower is ALWAYS the same height. Obviously. L.H."
- in: `d` Big city, big buildings, big stories. Everybody's heard something about everything here. / `k` That page says the Eiffel Tower is always the same height. / `d` Then it's never been to Paris in summer.
- out: `k` The skyscraper wobbled, and nothing fell down! / `d` It's meant to bend a bit, like a tree in the wind. Now, the pages blew into the park. It's sports day. / `k` Finally, something I'm good at.
- Flee: `h` "To sports day! Everybody knows where your heart is!" `d` Do they, though?

**5. Sports Day**
- Note: "Your heart is on the LEFT. Hand on heart, everybody knows. L.H."
- in: `k` It's sports day, and the pages are running the races! / `d` Then let's learn what our bodies really do. Bones, hearts, teeth, the lot. / `k` And yawns? I'm already yawning.
- out: `d` Your heart's in the middle, with a little lean to the left. Like you at the finish line. / `k` The pages are blowing up that hill, toward the spinny thing. / `d` A weather station. Bring a coat. And a raincoat. Actually, bring everything.
- Flee: `h` "Up the hill! Everybody says the weatherman is ALWAYS wrong!" `k` Not always!

**6. The Weather Station**
- Note: "Clouds weigh NOTHING. They're fluffy. Everybody says. L.H."
- in: `k` What's that spinny cup thing? / `d` An anemometer. It measures the wind. Weather people check things every single day. / `k` Then they'll love us. The pages say clouds weigh nothing!
- out: `k` That cloud weighed as much as a hundred elephants! / `d` Floating along in tiny drops. Now look up. The pages are climbing the mountains. / `k` I'm going to need a bigger snack.
- Flee: `h` "Higher! Everybody says the top is closer to the Sun!" `d` By about one mountain.

**7. The Mountains**
- Note: "Everest is the TALLEST. Everybody's teacher said so. L.H."
- in: `d` Mountains. The air's thin, the goats are fancy, and the pages are very sure of themselves. / `k` This one says it's colder up here because we're far from the ground. No, wait, closer to the Sun. / `d` The Sun is 150 million kilometres away. A mountain doesn't get you any closer.
- out: `k` Everest is the highest, but Mauna Kea is the tallest. They both win! / `d` That's how facts work: you say exactly what you mean. Now, see that rocket? Lady Hearsay just hitched a ride. / `k` To space? Dad, are we going to SPACE?
- Flee: `h` "Up, up, UP! Everybody says the Sun is a big fire!" `d` Then we finish this up there.

**8. The Space Station**
- Note: "The Sun is a giant CAMPFIRE. Come and see, if you dare. L.H."
- in: `k` We're on the space station! I feel taller. / `d` You are taller. Up here your back stretches out a bit. It goes back when we land. / `k` Then let's pop these pages before I shrink.
- out (runs inside the Ending, like Book 1's `story_8_out`): `d` Every page of the Little Book of Everybody Says, popped and checked. / `k` Dad, how do we know all this stuff is true? / `d` Somebody checked. Then somebody checked them. And now you're one of the checkers.

---

## 2. The 40 new myths

How they were chosen:
- **Checked against all 155 Book 1 myths by meaning,** not just by id. No new id clashes with an existing one.
- **Each fact was checked with web searches.** Where sources disagreed on a number, the number was dropped (as the Book 1 fact-check did).
- **Nothing scary, gross, or about illness, death, religion, politics or body image.**
- **Kinds** reuse the existing creep kinds.
- **Source in game** is the name Dad gives in the Diary (the `META` entry). The game must not link out (Apple 1.3 for kids' apps), so the URLs stay in this report.

**Boss** marks each world's boss (the stage-5 boss; stage 3 is its rough draft). Every world uses "rough draft", with no separate mid-boss.

### 🍳 The Kitchen

| id | | Name | Myth | Fact | Kind | Source in game · URL |
|---|---|---|---|---|---|---|
| `microwave` | 📻 | Middle-Out Microwave | Microwaves cook food from the inside out. | Microwaves heat the outside of food first, about two fingers deep. The heat then creeps into the middle. That's why you stir and wait. | splitter | FDA · https://hgic.clemson.edu/factsheet/microwave-food-safety/ (cites FDA/USDA) |
| `saltboil` | 🧂 | Speedy Salt | Salt makes water boil faster. | Salt actually makes water boil at a slightly *higher* temperature. A pinch makes almost no difference. People add it for flavour. | normal | Live Science · https://www.livescience.com/56214-does-salt-make-water-boil-faster.html |
| `honeycrunch` | 🍯 | Gone-Off Honey | When honey turns hard and crunchy, it has gone bad. | That's just its sugar making crystals. It's still good to eat. A grown-up can stand the jar in warm water to make it runny again. | healer | Oregon State University · https://extension.oregonstate.edu/node/79551 |
| `purplecarrot` | 🥕 | Always-Orange Carrot | Carrots have always been orange. | Long ago, most farm carrots were purple or yellow. Orange carrots got popular in Europe about 400 to 500 years ago. | fast | Washington State University · https://askdruniverse.wsu.edu/2020/04/17/why-are-carrots-orange/ |
| `eggequinox` **Boss** | 🥚 | The Equinox Egg | You can only stand an egg on its end on the first day of spring. | With patience, you can stand an egg up on any day of the year. The calendar has nothing to do with it. | boss | McDonald Observatory · https://stardate.org/?p=17865 |

### 🚜 The Farm

| id | | Name | Myth | Fact | Kind | Source in game · URL |
|---|---|---|---|---|---|---|
| `pigmud` | 🐷 | Messy Pig | Pigs roll in mud because they're dirty. | Pigs can hardly sweat, so they roll in mud to cool down. The mud works like sunscreen too. | tank | University of Missouri · https://extension.missouri.edu/news/pigs-cant-sweat-to-cool-off-give-them-help-on-hot-days |
| `horsesleep` | 🐴 | Stand-Up Snoozer | Horses only sleep standing up. | Horses can doze standing up. For their deepest, dreamiest sleep they lie down, even if only for a little while. | dasher | Scientific American · https://www.scientificamerican.com/article/horses-stand-up-to-sleep-but-lie-down-perchance-to-dream/ |
| `sheepface` | 🐑 | Forgetful Sheep | Sheep can't tell one face from another. | Sheep are great with faces. Scientists in Cambridge taught sheep to pick out famous people from photos. | swarm | University of Cambridge · https://www.cam.ac.uk/research/news/sheep-are-able-to-recognise-human-faces-from-photographs |
| `rooster` | 🐓 | Dawn-Only Rooster | Roosters only crow when the sun comes up. | Roosters crow all day long. Their big morning crow comes from a body clock, so they know morning is coming even in the dark. | pelter | National Geographic · https://www.nationalgeographic.com/animals/article/130318-rooster-crow-circadian-clock-science |
| `cowtummy` **Boss** | 🐄 | The Four-Tummy Cow | Cows have four stomachs. | A cow has one big stomach with four parts. The biggest part is like a giant mixing tub, where tiny helpers break down grass. | boss | Britannica · https://www.britannica.com/animal/cow |

### 🏛️ The Museum

| id | | Name | Myth | Fact | Kind | Source in game · URL |
|---|---|---|---|---|---|---|
| `stegorex` | 🦖 | Neighbour T. rex | T. rex and Stegosaurus lived at the same time. | Stegosaurus was gone long before T. rex came along. More time separates them than separates T. rex from us! | hardcover | American Museum of Natural History · https://www.amnh.org/explore/videos/dinosaurs-and-fossils/11-questions-stegosaurus |
| `pterosaur` | 🪽 | Flying Dino | Pterodactyls were flying dinosaurs. | Pterosaurs were flying reptiles: cousins of dinosaurs, but not dinosaurs. The only flying dinosaurs are birds. | flyer | American Museum of Natural History · https://www.amnh.org/explore/news-blogs/on-exhibit-posts/not-a-bird-not-a-dinosaur-what-is-a-pterosaur |
| `paintstatue` | 🗿 | Plain White Statue | Ancient Greek statues were plain white. | They were painted in bright colours. Most of the paint wore off over thousands of years, but scientists still find tiny traces. | rumour | NPR, British Museum study · https://www.npr.org/2022/07/12/1109995973/we-know-greek-statues-werent-white-now-you-can-see-them-in-color |
| `armour` | 🛡️ | Crane Knight | Knights' armour was so heavy they needed a crane to get on their horses. | Armour was heavy, but it was spread over the whole body. Knights could walk, run and climb onto their horses by themselves. | hardcover | The Met · https://www.metmuseum.org/perspectives/sunday-at-the-met-legends-and-true-stories · https://www.eurekalert.org/news-releases/675790 (Royal Armouries study) |
| `birddino` **Boss** | 🐦 | The Last Dinosaur | All the dinosaurs died out long ago. | Birds are dinosaurs! The giant ones are gone, but their feathered relatives are outside your window right now. | boss | American Museum of Natural History · https://www.livescience.com/54086-dinosaurs-evolved-into-birds-museum-exhibit.html · https://carnegiemnh.org/amazing-just-like-a-dinosaur/ |

### 🏙️ The City

| id | | Name | Myth | Fact | Kind | Source in game · URL |
|---|---|---|---|---|---|---|
| `eiffel` | 🗼 | Same-Size Tower | The Eiffel Tower is always the same height. | The tower is iron, and iron grows a tiny bit when it's hot. On sunny days it stands a little taller and even leans away from the sun. | normal | Eiffel Tower (official) · https://www.toureiffel.paris/en/news/history-and-culture/why-does-eiffel-tower-change-size |
| `bigben` | 🔔 | Big Ben Clock | Big Ben is the name of London's clock tower. | Big Ben is the nickname of the giant bell inside. The tower is called the Elizabeth Tower. | gossip | UK Parliament · https://www.parliament.uk/about/living-heritage/building/palace/big-ben/building-clock-tower/key-dates-/ |
| `liberty` | 🗽 | Always-Green Statue | The Statue of Liberty has always been green. | She started out shiny copper, like a new penny. Air and sea spray slowly turned her green, and the green coat protects the metal underneath. | caster | American Chemical Society · https://www.acs.org/pressroom/reactions/library/the-statue-of-libertys-true-colors.html |
| `pigeon` | 🐦‍⬛ | Bird-Brain Pigeon | Pigeons are silly birds that can't learn anything. | Pigeons are clever. Scientists taught pigeons to tell paintings by two different artists apart, even paintings they had never seen. | fast | Journal of the Experimental Analysis of Behavior · https://pmc.ncbi.nlm.nih.gov/articles/PMC1334394/ |
| `skyscraper` **Boss** | 🏢 | The Stiff Skyscraper | Skyscrapers stand perfectly still. | Tall buildings are built to sway a little in the wind, like trees. Bending a bit keeps them from breaking. | boss | NPR · https://www.npr.org/transcripts/141858484 · https://scienceworld-aem-perf.scholastic.com/issues/2016-17/032717/sky-high-science.html |

### 🏅 Sports Day

| id | | Name | Myth | Fact | Kind | Source in game · URL |
|---|---|---|---|---|---|---|
| `babybones` | 🍼 | Same-Bones Baby | Babies have the same number of bones as grown-ups. | Babies are born with about 270 bones. As they grow, some join together, so grown-ups have about 206. | splitter | Cleveland Clinic · https://my.clevelandclinic.org/health/body/25176-bones |
| `livebone` | 🦴 | Dry-Stick Bone | Bones are dry and dead, like sticks. | Your bones are alive! They grow as you grow, and they can even fix themselves. | tank | Cleveland Clinic · https://my.clevelandclinic.org/health/body/25176-bones |
| `teethbone` | 🦷 | Bony Tooth | Teeth are bones. | Teeth aren't bones. Their hard outside, called enamel, can't grow back, so brushing really matters. | hardcover | Cleveland Clinic · https://health.clevelandclinic.org/are-teeth-bones |
| `yawn` | 🥱 | Air-Gulp Yawn | You yawn because your body needs more air. | Scientists tested it: breathing extra oxygen didn't stop people yawning. They're still working out why we yawn, and why yawns are catching! | rumour | University of Washington · https://faculty.washington.edu/chudler/yawning.html (Provine, 1987) |
| `heartleft` **Boss** | ❤️ | The Left-Side Heart | Your heart is on the left side of your chest. | Your heart sits in the middle of your chest, behind your breastbone, with its bottom tipped a little to the left. | boss | Cleveland Clinic · https://my.clevelandclinic.org/health/body/21704-heart |

### 🌦️ The Weather Station

| id | | Name | Myth | Fact | Kind | Source in game · URL |
|---|---|---|---|---|---|---|
| `heatbolt` | 🌩️ | Heat Lightning | Hot summer nights make a special silent "heat lightning". | It's ordinary lightning from a storm too far away to hear the thunder. If you can hear thunder, go indoors. | dasher | National Weather Service · https://www.weather.gov/safety/lightning-heat |
| `fog` | 🌫️ | Sky-Only Cloud | Clouds only live high up in the sky. | Fog is a cloud that sits on the ground. When you walk through fog, you're walking through a cloud! | rumour | Met Office · https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/fog |
| `groundhog` | 🐿️ | Weather Groundhog | A groundhog can tell if spring will come early. | Weather scientists at NOAA checked. The most famous groundhog, Phil, was right only about a third of the time. | gossip | NOAA · https://www.noaa.gov/heritage/stories/grading-groundhogs |
| `forecast` | 📡 | Always-Wrong Forecast | Weather forecasts are always wrong. | Forecasts for the next few days are right most of the time. It's forecasts more than a week ahead that are often wrong. | caster | NOAA · https://www.nesdis.noaa.gov/about/k-12-education/weather-forecasting/how-reliable-are-weather-forecasts |
| `cloudweight` **Boss** | ☁️ | The Featherweight Cloud | Clouds weigh nothing at all. | One puffy cloud can weigh about 500 tonnes, as much as about a hundred elephants. Its water drops are so tiny that they float. | boss | USGS · https://www.usgs.gov/water-science-school/science/how-much-does-a-cloud-weigh |

### ⛰️ The Mountains

| id | | Name | Myth | Fact | Kind | Source in game · URL |
|---|---|---|---|---|---|---|
| `himalaya` | 📏 | Finished Mountain | Mountains never change size. | Some mountains are still growing! The Himalayas get a few millimetres taller each year as India slowly pushes into Asia. | tank | PBS NOVA · https://www.pbs.org/wgbh/nova/everest/earth/birthmountains.html |
| `mountcold` | 🥶 | Closer-to-the-Sun Peak | Mountain tops should be warm because they're closer to the Sun. | The Sun is so far away that a mountain doesn't bring you any closer. Air up high is thinner and holds less heat, so it's colder. | pelter | Hong Kong Observatory · https://www.weather.gov.hk/en/education/weather/folklore/00079-the-higher-you-climb-the-colder-it-gets-explained.html |
| `icevolcano` | 🌋 | Hot-Places Volcano | Volcanoes only happen in hot places. | Mount Erebus, in icy Antarctica, is an active volcano. It even has a bubbling lake of lava at the top. | caster | NASA · https://earthobservatory.nasa.gov/images/87444/mount-erebus-antarctica |
| `mtgoat` | 🐐 | Not-a-Goat Goat | Mountain goats are goats. | Mountain goats aren't true goats. They're goat-antelopes, cousins of goats, with grippy hooves for climbing rocks. | dasher | National Park Service · https://www.nps.gov/kefj/learn/nature/mountain-goat.htm |
| `everest` **Boss** | 🏔️ | The Tallest Everest | Mount Everest is the tallest mountain in the world. | Everest is the highest above the sea. But Mauna Kea in Hawaii is taller, from its bottom deep under the ocean to its top. | boss | Guinness World Records · https://www.guinnessworldrecords.com/world-records/tallest-mountain · https://www.earthdate.org/worlds-tallest-mountain |

### 🛰️ The Space Station

| id | | Name | Myth | Fact | Kind | Source in game · URL |
|---|---|---|---|---|---|---|
| `spacetall` | 🧑‍🚀 | Same-Height Astronaut | You stay the same height in space. | Astronauts get up to about 5 cm taller while they float, because nothing squashes their backbones. They shrink back on Earth. | normal | Smithsonian · https://www.smithsonianmag.com/smart-news/space-makes-astronauts-grow-taller-and-also-backs-180960922/ |
| `twinkle` | ✨ | Twinkly Star | Stars twinkle all by themselves. | Stars shine steadily. The twinkle comes from Earth's wobbly, windy air. Above the air, stars don't twinkle at all. | rumour | NASA · https://apod.nasa.gov/apod/ap000725.html |
| `issspot` | 🛰️ | Hidden Space Station | You need a telescope to see the space station. | You can see it with just your eyes. It looks like a bright star with no blinking lights, crossing the sky in a few minutes. | flyer | NASA · https://spotthestation.nasa.gov/ |
| `spaceline` | 🚀 | Far-Away Space | Space starts millions of kilometres up. | Space starts only about 100 km up. If a car could drive straight up, it would get there in about an hour. | fast | Space.com · https://www.space.com/karman-line-where-does-space-begin |
| `sunfire` **Boss** | ☀️ | The Campfire Sun | The Sun is a giant ball of fire. | Fire needs oxygen, and the Sun has hardly any. The Sun shines because tiny bits of hydrogen squeeze together deep inside it. | boss | NASA · https://starchild.gsfc.nasa.gov/docs/StarChild/questions/question36.html |

**Final boss:** `hearsay` 🗣️ **Lady Hearsay**. Myth: "If everybody says it, it must be true." Fact: "Lots of people saying something doesn't make it true. Good thinkers ask where an idea came from, and check." Kind: boss. Source in game: Understanding Science, UC Berkeley (the same as `sses`).

### Boss moves (one new tell each, built from the existing `BOSSMOVE` pattern)

| Boss | Tell | What it does |
|---|---|---|
| Equinox Egg | "Watch me BALANCE." | Wobbles, then stands up tall and shrugs off hits for 2 s. Stun it while it wobbles. |
| Four-Tummy Cow | "Mmm, myths." | Swallows two nearby myths, then spits them back out tougher. Stun it to stop the swallow. |
| The Last Dinosaur | "FLAP!" | Hops into the air over traps and lands inside the ring. |
| The Stiff Skyscraper | "I never wobble!" (it wobbles) | A wide sway that shoves friends back to the ring edge. |
| The Left-Side Heart | "Ba-DUM." | Pulses that push friends out and speed up nearby myths. |
| The Featherweight Cloud | "Foggy!" | Hides the myths outside the ring for 3 s (reuses the Starry `fade`). |
| The Tallest Everest | "Still GROWING!" | Gets bigger and tougher until stunned. |
| The Campfire Sun | "Toasty!" | Rings of heat (reuses `hot`), and serves as Lady Hearsay's shield. |
| Lady Hearsay | "Pass it on!" | Borrows a Book 2 boss move each time, and turns two myths into Gossips. |

### Flagged: left out, or included with care

**Left out:**
- **Honey never goes bad.** The 3,000-year-old tomb honey story is disputed. Swapped for the crunchy-honey myth, which is solid.
- **Raccoons wash their food.** The idea is right ("dousing" to feel the food), but I found only weak, secondary sources. Add it if a zoo or university page turns up.
- **The tongue is the strongest muscle.** "Strongest" has no single meaning, and the sources argue.
- **The comet tail points behind it.** True for the gas tail, but not for every tail. Too fiddly for a 5-year-old.
- **Astronauts float because there's no gravity.** It duplicates Book 1's `gravity`.
- **Chickens can't fly.** It duplicates the `turkeyfly` event myth.
- **Clouds block sunburn.** Too close to the `wintersun` event myth.
- **Also dropped:** hot water freezes faster (contested), no two snowflakes alike (contested), spinach and iron (the myth's own history is a myth), shouting causes avalanches (true myth, but scary).

**Included, with care:**
- **`eiffel`:** the official site says "a few millimetres". Popular sites say 15 cm. The fact gives no number.
- **`spaceline`:** 100 km is the international line. NASA and the US Air Force use 80 km. "About 100 km" is safe.
- **`pigmud`:** pigs do have a few sweat glands, so the fact says "hardly sweat", not "can't sweat".
- **`purplecarrot`:** wild carrots were pale. The fact says "farm carrots".
- **`everest`:** where Mauna Kea's base starts is debated. The fact avoids exact heights.
- **`yawn`:** only the oxygen test is settled, so the fact says scientists are still working out why we yawn.
- **`heatbolt`:** it carries a safety line ("If you can hear thunder, go indoors").
- **Near neighbours of Book 1 myths, different claims:**
  - `mountcold` (distance from the Sun) sits beside Book 1's `seasons`.
  - `stegorex` (dinosaur time gaps) sits beside `dinopeople`.
  - `heatbolt` sits beside `bolt`.
  - `purplecarrot` sits beside `carrots`.
- **Spare myth:** brown eggs are healthier than white (USDA: shell colour comes from the hen's breed, not nutrition). It can replace any myth above.
- **Before shipping:** this session could not open the URLs directly (outbound fetch was blocked). Every link came from a web search result, and `britannica.com/animal/cow` was confirmed only through a search summary. Click through all 40 before release, as in the Book 1 fact-check.

---

## 3. Bosses

| World | Boss | Why it's the biggest |
|---|---|---|
| Kitchen | 🥚 The Equinox Egg | Repeated every spring on TV and in schools |
| Farm | 🐄 The Four-Tummy Cow | Nearly every kid has heard it |
| Museum | 🐦 The Last Dinosaur | The most surprising fact in the book |
| City | 🏢 The Stiff Skyscraper | Tall sprite, great boss shape |
| Sports Day | ❤️ The Left-Side Heart | Hand-on-heart is everywhere |
| Weather Station | ☁️ The Featherweight Cloud | Funny contrast: huge and "weightless" |
| Mountains | 🏔️ The Tallest Everest | Classic "it depends how you measure" |
| Space Station | ☀️ The Campfire Sun | Her shield in the finale |
| **Final** | 🗣️ **Lady Hearsay** | "If everybody says it, it must be true" |

---

## 4. Difficulty and progression

### Where Book 1 leaves a player (from `Checks, build 77-78.md` and the code)

- **Typical player in stages 31–40:** wins 95% with at least 82 Patience left. Strong players win 100% with 95 left. Players who never upgrade win 80%, with as little as 36 left.
- **Unspent wealth:** a player who never opens the Shop reaches stage 40 with about **46,000 coins and 4,450 gems**.
- **Little left to want:** levels 20–30 and training ranks 6–25 give little to work for. The report says only Book 2 would really use them.
- **Current tuning:** `TUNE = { hp: 2.2, hs: .05, dmg: 1.1, ds: .01 }`.
- **`recPower` on Normal:** 5,780 at stage 30, 6,860 at stage 36, 7,400 at stage 39, and **7,990** for the Night Sky 5 boss stage. Hard ×1.3, Myth Master ×1.8.
- **Friend level cap:** 30 (`charLevel`: `L < 30`, `xpNeed = 25 × L`).
- **Training ranks:** 5 per star, up to 25 at five stars. Crit opens at level 10, Lucky at 20.

### How Book 2 should scale

**Don't just carry on the stage index to 79.** The myth-health formula is quadratic in the stage. At index 79, myths would have **7.4 times** Book 1's final health, while `recPower` rises only 2 times. That's a wall.

**Use a Book 2 tier instead.** Book 2 stage `k` (0–39) plays at tier `t = 36 + 0.75k` for speed, extra elites and `recPower`. Its myth health follows a gentler, straight line: `hp(36) × (1 + 0.05k)`.

| | Book 2 start (k = 0) | Mid (k = 20) | Finale (k = 39) |
|---|---|---|---|
| Plays like | Night Sky 2 | | |
| `recPower`, Normal | about 6,860 | about 9,560 | about 13,100 |
| Myth health vs Book 1's finale | ×0.82 | ×1.6 | ×2.4 |

So returning players start comfortable, and the curve climbs to about 1.6 times Book 1's top `recPower`.

**Targets for `balance_sim.mjs`:** use the same three player types as Book 1.
- Typical: 100% wins with at least 85 Patience in Book 2 chapters 1–4. About 90–95% wins with at least 70 in chapters 7–8.
- Never-upgrades: should need to replay sometimes. That's what the 46,000 spare coins are for.
- Add a Book 2 sweep to the sim: start each run from a save at Book 1's end.

### New things to grow into (levels 30–40)

Spread these out, one at a time, as the competitor research advises.

| Level | Unlock | Code |
|---|---|---|
| 30 → 40 | **Level cap raised to 40.** Each level past 30 costs a flat 750 XP, about 7,500 XP in all, so it isn't a grind. | `charLevel`: `L < (bookTwo ? 40 : 30)`; `xpNeed` capped at 750 |
| 32 | **Focus** training row (+boss and elite damage) | `WRANKS.focus = { base: 160, step: 70, at: 32 }` |
| 34 | **Sixth star** ("Gold Star"): ranks 26–30. Paid in Book 2 pages, so Book 1 grinding can't skip it. | `rankCap`: `5 × min(6, stars)` |
| 36 | **Fourth skill-tree pick** per branch | `TREE_MAX` 3 → 4 at level 36 |
| 38 | **Second pair-up:** a friend can join two synergies | a `SYN_AT` second tier |
| 40 | A cosmetic only: a silver frame and the "Little Book of How" badge | achievement |

**Diary:** the 40 new facts add to the existing topics, so `CATBON` bonuses keep growing. Book 2 adds 8 new chapter traits, one per world (`TRAITS[8…15]`), and 8 new `VARIANT` entries. Ideas:
- Kitchen "Simmering": myths speed up the longer they live.
- Weather "Gusty": myths drift sideways.

### How Book 2 opens

- **When:** after Book 1's credits (stage 39 cleared). The credits' "What's next?" line gets a third line: "📖 A little overdue book just came back to the library…". Tapping "Back to the backyard" plays the Book 2 prologue once.
- **Book picker on the map:** two book tabs at the top, "📖 Big Book of Why" and "📗 Little Book of Everybody Says". It remembers the last one. Players who haven't finished Book 1 see the second tab locked, with "Finish Book 1 to open". There's no early access and nothing to buy.
- **Book 1 stays playable:** Hard, Myth Master, Endless and events still pick from both books once Book 2 is open.

---

## 5. What it needs to build

### Code changes

1. **Data:**
   - Add `book: 1` to the 8 existing `WORLDS` and `book: 2` to the 8 new ones.
   - Add `VILLAIN2`, `SHOWDOWN2`, `ENDING2` and `PROLOGUE2` next to the existing ones.
   - Add the 41 myths (40 plus `hearsay`) to `MYTHS`, with `META` entries (topic and source name).
2. **Stages:** `STAGES` is built from `WORLDS`, so it grows to 80 with no extra work. Each stage gets `book` and `k` (its index within the book) for the tier formula in section 4.
3. **Stop assuming one book.** Replace the hard-coded "last" checks with per-book ones. About 20 places:
   - `STAGES.length - 1` (11 uses), `WORLDS.length - 1` (3), `n === 8` (2).
   - `finale:` in the `STAGES` builder.
   - The `why` achievement (pin it to stage 39 and add a `how` achievement for stage 79).
   - `chapterFrames` and `showComic` titles ("Chapter 9" should read "Book 2, Chapter 1").
4. **Story:**
   - `chapterFrames` picks `VILLAIN` or `VILLAIN2` by book.
   - Add the `h` voice to `FACE`, `WHO`, `EMO_IMG` and the `gen_voice.py` `CAST`.
   - Her arena drawing reuses `drawSses` with an `hs_` prefix.
5. **Map:**
   - `buildMap` and `pinXY` show 40 pins for the chosen book.
   - The book tabs. `map_${w+1}` and `arena_${w+1}` already scale to 9–16.
6. **Save fields** (no migration needed, as the defaults are empty):
   - `save.book` (1 or 2, the map tab).
   - `save.b2 = { intro: false, end: false }`.
   - `save.cleared`, `save.stars` and `save.facts` keep working, with indices 40–79.
   - `save.unlocked` already counts up.
7. **Progression:** level cap 40, Focus row, sixth star, fourth tree pick, second pair-up (section 4).
8. **Balance:** add a Book 2 sweep to `tools/balance_sim.mjs`. Retune until it meets the section 4 targets.
9. **Safety checks:**
   - No links out.
   - The Diary shows source names only.
   - New systems open one at a time.
   - Re-run the colour-blind and readability checks on the new arenas.

### Art list

The pipeline: Gemini image (Nano Banana) for 2D, run through `tools/gen_art.py`. Then `sw_list.py` makes the WebP copies.

| What | Count | Names | Notes |
|---|---|---|---|
| Arenas | 8 | `arena_9`…`arena_16` | Kitchen floor, farmyard, museum hall, city plaza, sports field, weather-station roof, mountain ledge, station module |
| Map backdrops | 8 | `map_9`…`map_16` | |
| Home backgrounds | 8 | `home_bg_9`…`16` | Optional but cheap |
| Bosses | 8 | `boss_<id>` plus 3D sheets | Drawn first, then Meshy, like the Book 1 bosses |
| Lady Hearsay | 6 | `hs_face`, `hs_idle`, `hs_scribble`, `hs_flee`, `hs_shout`, `hs_kind` | The same poses as Sir Ever-So-Sure, plus a credits picture |
| Story pictures | about 31 | `story_b2_p1`…`p4`, `story_9_in`…`story_16_out`, the flees, `story_16_boss`, `story_b2_end1`…`3` | |
| Myth sprites | 0 | | Myths are paper pages with an emoji face on the existing creep sheets. All 41 emojis are standard. 🐦‍⬛ (pigeon) needs a check on older phones; fall back to 🐦. |
| Native friends (optional, recommended) | 8 × 2 | `pet_<id>` and `_atk` | Crumbs the mouse, Clucky the hen, Pip-Rex the chick-sized dinosaur, Coo the pigeon, Zippy the hare, Gust the swift, Hoof the mountain goat, Tardi the tardigrade |

### Voice lines

| Group | Lines |
|---|---|
| Myth and fact lines (41 × 2) | 82 |
| World comics (8 × 6) | 48 |
| Notes, flees and recaps (8 + 14 + 7) | 29 |
| Sir Ever-So-Sure hints (one per chapter) | 8 |
| Prologue, showdown, ending and in-arena lines | about 25 |
| **Total** | **about 190 clips** |

At Gemini TTS Tier 1 (100 clips a day), that's 2 days of `gen_voice.py`.

### Credits and cost (estimates)

**Gemini images:** about 95 final images. Allow 2.5 tries each, so about 240 generations. That's about **$9 on 2.5 Flash** ($0.039) or about **$32 on Pro** ($0.134). Story pictures on Pro, the rest on Flash comes to about $20.

**Meshy:** 9 boss models (8 plus Lady Hearsay) at about 35 credits each (image-to-3D plus texture), about 315. Add about 100 for retries: **about 400–450 credits**. With the 8 native friends in 3D, add about 280: **about 700**. The 3D style benchmark says the account had 12 credits, resetting 6 November, so this needs a paid month.

**Gemini TTS:** 190 clips, small cost. The limit is the 100-a-day cap, not money.

**Music (optional):** 8 world loops and a Lady Hearsay theme with `lyria.py`. Or reuse the Book 1 tracks by mood.

### Order of work

| Phase | What | Rough time | Needs credits? |
|---|---|---|---|
| 0. Skeleton | `book` field, 80 stages, the "last stage" checks, map tabs, save fields, the 41 myths. Placeholder art (reuse the Book 1 arenas with a tint). | 3–4 days | No |
| 1. Balance | Level cap 40, new rows and stars, Book 2 tier, a sim sweep, retune | 2–3 days | No |
| 2. Fact pass | Click through all 40 URLs. A second reader checks the facts for a 5-year-old. | 1 day | No |
| 3. Art | 8 arenas, 8 maps, Lady Hearsay's poses, boss drawings, then Meshy bosses, then story pictures | 4–6 days | Gemini, then Meshy |
| 4. Story and voice | Comics in, voices recorded (2 days at the cap), credits page 2 | 2–3 days | Gemini TTS |
| 5. Friends (optional) | 8 native friends: art, abilities, synergies | 4–6 days | Gemini (and Meshy if 3D) |
| 6. Checks | First-play check of the Book 2 opening, speed test on the new art, colour-blind check, bug hunt with a faked clock | 2 days | No |

Phases 0–2 need no money, so they can start now. Phase 3 waits for the Meshy credits.
