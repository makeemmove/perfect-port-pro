export interface CityEvent {
  name: string;
  date: string;
  time: string;
  sub: string;
  cost: string;
  desc: string;
  location?: string;
  url?: string;
}

export const EVENTS: CityEvent[] = [
  // February 2026
  {name:"AARP Free Tax Preparation Service",date:"2026-02-02",time:"9:00 AM",sub:"Community",cost:"Free",desc:"Free in-person tax preparation by AARP volunteers, 9am-12noon",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverma.gov/Calendar.php"},
  {name:"Native American Storytelling & Crafts",date:"2026-02-19",time:"2:00 PM",sub:"Community",cost:"Free",desc:"Native American storytelling and crafts with the Pocasset Wampanoag Tribe",location:"Fall River Public Library, 104 North Main St",url:"https://www.vivafallriver.com/events"},
  {name:"SketchyGOichie DRAW! Winter 2026",date:"2026-02-28",time:"12:00 PM",sub:"Arts & Culture",cost:"Paid",desc:"Drawing workshop/event",location:"Various, Fall River",url:"https://www.vivafallriver.com"},
  {name:"Kid's Art Workshop with Susan Drayton",date:"2026-02-28",time:"12:00 PM",sub:"Arts & Culture",cost:"Paid",desc:"Children's art workshop with local artist",location:"Various, Fall River",url:"https://www.vivafallriver.com"},
  // March 2026
  {name:"Drawing the Figure (SoCo Art Labs)",date:"2026-03-01",time:"1:00 PM",sub:"Community",cost:"Free",desc:"Figure drawing with live model, adults only",location:"SoCo Art Labs, 418 Quequechan St",url:"https://www.vivafallriver.com/events"},
  {name:"Spilling the Tea: Victorian Tea Party",date:"2026-03-01",time:"2:00 PM",sub:"Community",cost:"Paid",desc:"Victorian tea party with true crime history at Lizzie Borden House",location:"Lizzie Borden House",url:"https://www.vivafallriver.com/events"},
  {name:"Author Talk: The Women of Arlington Hall",date:"2026-03-01",time:"2:00 PM",sub:"Community",cost:"Free",desc:"Author talk about WWII code-breaking women",location:"Fall River Public Library, 104 North Main St",url:"https://www.vivafallriver.com/events"},
  {name:"Story Time with Christine Devane",date:"2026-03-01",time:"10:00 AM",sub:"Community",cost:"Free",desc:"Children's story time",location:"Various, Fall River",url:"https://www.vivafallriver.com/events"},
  {name:"Heritage State Park Daily Tours",date:"2026-03-01",time:"10:00 AM",sub:"Park/Nature",cost:"Free",desc:"Self-guided and guided tours of the visitor center",location:"Fall River Heritage State Park, 100 Davol St",url:"https://www.mass.gov/locations/fall-river-heritage-state-park"},
  {name:"Free Yoga Classes",date:"2026-03-02",time:"9:00 AM",sub:"Community",cost:"Free",desc:"Beginner-friendly yoga focusing on alignment and breath work",location:"Various locations, Fall River",url:"https://www.vivafallriver.com/events"},
  {name:"Historical Fiction Book Club",date:"2026-03-02",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Adult book club focused on historical fiction",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Bookmobile at River Falls Senior Living",date:"2026-03-02",time:"10:00 AM",sub:"Library",cost:"Free",desc:"Bookmobile visit to senior living community",location:"River Falls Senior Living, Fall River",url:"https://fallriverlibrary.org/events"},
  {name:"Happy Birthday Dr. Seuss with Mr. Mello",date:"2026-03-03",time:"11:00 AM",sub:"Library",cost:"Free",desc:"Dr. Seuss birthday celebration for children",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Preschool Storytime",date:"2026-03-03",time:"11:00 AM",sub:"Library",cost:"Free",desc:"Stories, literacy movie, craft for ages 3-5",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Conservation Commission Meeting",date:"2026-03-03",time:"5:30 PM",sub:"Community",cost:"Free",desc:"Monthly Conservation Commission meeting",location:"Fall River City Hall, One Government Center",url:"https://fallriverma.gov/Calendar.php"},
  {name:"Play & Learn",date:"2026-03-04",time:"10:00 AM",sub:"Library",cost:"Free",desc:"Early childhood play and learning program",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"English Conversation Group",date:"2026-03-04",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Practice English speaking and listening skills, beginners welcome",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Head Start Program",date:"2026-03-05",time:"10:00 AM",sub:"Library",cost:"Free",desc:"Early childhood education program",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Knitting Club",date:"2026-03-05",time:"1:00 PM",sub:"Library",cost:"Free",desc:"Knitting and crochet group, beginners welcome",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Teen Game Night",date:"2026-03-05",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Chess Club",date:"2026-03-07",time:"12:30 PM",sub:"Library",cost:"Free",desc:"Chess for all skill levels",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Cadette Comic Artist Workshop",date:"2026-03-08",time:"1:30 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Girl Scout merit badge workshop at Battleship Cove",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Author Talk: Lida Perry – Aging with Joy",date:"2026-03-09",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Local author discusses her book on aging gracefully",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"The Great LEGO Leprechaun Trap Challenge",date:"2026-03-10",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Build a leprechaun trap with LEGOs, winner gets a prize",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Board of Library Trustees Meeting",date:"2026-03-11",time:"3:00 PM",sub:"Library",cost:"Free",desc:"Public library board meeting",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Magic: The Gathering Commander Club",date:"2026-03-11",time:"6:00 PM",sub:"Library",cost:"Free",desc:"MTG Commander for teens and adults 13+",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Writing Group",date:"2026-03-11",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community and feedback group",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Wire and Bead Crystal Hanger Craft",date:"2026-03-12",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Wire wrapping craft workshop, registration required",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"YA Comics Club",date:"2026-03-12",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Comics, manga, graphic novels for teens 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Phelan Monsters Puppet Show",date:"2026-03-14",time:"11:00 AM",sub:"Library",cost:"Free",desc:"Children's puppet show",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Open Draw for Teens",date:"2026-03-14",time:"2:00 PM",sub:"Library",cost:"Free",desc:"Open drawing session for teens",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Safety Workshop – Scout Merit Badge",date:"2026-03-15",time:"1:00 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Spring 2026 Scouting Merit Badge Workshop at Battleship Cove",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Heritage State Park Spring Programs",date:"2026-03-15",time:"10:00 AM",sub:"Park/Nature",cost:"Free",desc:"Spring nature and history programs, free parking",location:"Fall River Heritage State Park, 100 Davol St",url:"https://www.mass.gov/locations/fall-river-heritage-state-park"},
  {name:"Creative Arts Network Events",date:"2026-03-15",time:"6:00 PM",sub:"Arts & Culture",cost:"Varies",desc:"Arts events in the Fall River Waterfront Cultural District",location:"Fall River Waterfront Cultural District",url:"https://www.creativeartsnetworks.org/events"},
  {name:"The Great Leprechaun Hunt!",date:"2026-03-17",time:"4:00 PM",sub:"Library",cost:"Free",desc:"St. Patrick's Day leprechaun hunt for kids",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Middle Grade Book Club",date:"2026-03-17",time:"5:00 PM",sub:"Library",cost:"Free",desc:"Book club for middle grade readers",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Books & Tea Club",date:"2026-03-18",time:"2:00 PM",sub:"Library",cost:"Free",desc:"Adult book club with tea",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Watercolor Workshop",date:"2026-03-18",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Adult watercolor painting workshop",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Gaming with BEAM!",date:"2026-03-19",time:"4:00 PM",sub:"Library",cost:"Free",desc:"Gaming program for teens",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Fantasy & Sci-Fi Book Club",date:"2026-03-19",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Book club for fantasy and science fiction fans",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Zoning Board of Appeals Meeting",date:"2026-03-19",time:"5:30 PM",sub:"Community",cost:"Free",desc:"Monthly Zoning Board of Appeals meeting",location:"Fall River City Hall, One Government Center",url:"https://fallriverma.gov/Calendar.php"},
  {name:"Homeschool Day at Battleship Cove",date:"2026-03-20",time:"9:00 AM",sub:"Museum/Attraction",cost:"$10-$15",desc:"Special homeschool day with workshops at Battleship Cove",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Trustees Mobile Adventures: Signs of Spring",date:"2026-03-21",time:"1:30 PM",sub:"Library",cost:"Free",desc:"Outdoor nature exploration program",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Daisy Craft & Mechanical Engineering",date:"2026-03-22",time:"10:00 AM",sub:"Museum/Attraction",cost:"Paid",desc:"Girl Scout workshop at Battleship Cove – SOLD OUT",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Read Across America Night",date:"2026-03-24",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Celebration of reading and literacy",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Photography Group",date:"2026-03-25",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Photography enthusiasts group meeting",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Voices Unheard Concert",date:"2026-03-26",time:"8:00 PM",sub:"Library",cost:"Free",desc:"Concert featuring underrepresented voices",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"City Council Public Meeting",date:"2026-03-28",time:"5:55 PM",sub:"Community",cost:"Free",desc:"City Council public hearing on Capital Improvement Plan",location:"Fall River City Hall, One Government Center",url:"https://fallriverma.gov/Calendar.php"},
  {name:"Citizenship in the Nation – Scout Workshop",date:"2026-03-29",time:"1:00 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Scouting Merit Badge Workshop – SOLD OUT",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  // April 2026
  {name:"English Conversation Group",date:"2026-04-01",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Practice English speaking and listening skills",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Teen Game Night",date:"2026-04-02",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Knitting Club",date:"2026-04-02",time:"1:00 PM",sub:"Library",cost:"Free",desc:"Knitting and crochet group",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Easter Scavenger Hunt",date:"2026-04-04",time:"9:00 AM",sub:"Museum/Attraction",cost:"Paid",desc:"Find 12 Easter eggs throughout the ships to win a prize",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Breakfast with the Easter Bunny",date:"2026-04-04",time:"9:00 AM",sub:"Museum/Attraction",cost:"Paid",desc:"Easter breakfast event with the Easter Bunny",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Chess Club",date:"2026-04-04",time:"12:30 PM",sub:"Library",cost:"Free",desc:"Chess for all skill levels",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Preschool Storytime",date:"2026-04-07",time:"11:00 AM",sub:"Library",cost:"Free",desc:"Stories, literacy movie, craft for ages 3-5",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Writing Group",date:"2026-04-08",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"YA Comics Club",date:"2026-04-09",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Comics and graphic novels for teens 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Brownie Making Games",date:"2026-04-12",time:"10:00 AM",sub:"Museum/Attraction",cost:"Paid",desc:"Girl Scout workshop",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Books & Tea Club",date:"2026-04-15",time:"2:00 PM",sub:"Library",cost:"Free",desc:"Adult book club with tea",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Watercolor Workshop",date:"2026-04-15",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Adult watercolor painting workshop",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Fantasy & Sci-Fi Book Club",date:"2026-04-16",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Book club for fantasy and science fiction fans",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Homeschool Day",date:"2026-04-17",time:"9:00 AM",sub:"Museum/Attraction",cost:"$10-$15",desc:"Special homeschool day with workshops",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Muckraker-palooza 2026",date:"2026-04-19",time:"3:00 PM",sub:"Community",cost:"Paid",desc:"Annual community festival and music event",location:"Woodlawn, Fall River",url:"https://www.eventbrite.com/d/ma--fall-river/events/"},
  {name:"Signs, Signals, and Codes – Scout Workshop",date:"2026-04-19",time:"1:00 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Scouting Merit Badge Workshop",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Little Theatre – Spring Production",date:"2026-04-25",time:"7:30 PM",sub:"Arts & Culture",cost:"Paid",desc:"Live theater production by Little Theatre of Fall River",location:"Narrows Center, Fall River",url:"https://newbedfordlight.org"},
  {name:"Citizenship in the World – Scout Workshop",date:"2026-04-26",time:"1:00 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Spring 2026 Scouting Merit Badge Workshop – SOLD OUT",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Junior Detective and Playing the Past",date:"2026-04-26",time:"1:00 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Girl Scout workshop – SOLD OUT",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Photography Group",date:"2026-04-29",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Photography enthusiasts group meeting",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  // May 2026
  {name:"Spring Craft, Vendor Fair & Food Trucks",date:"2026-05-01",time:"10:00 AM",sub:"Community",cost:"Free",desc:"Spring craft fair with vendors and food trucks",location:"Liberal Club, Fall River",url:"https://festivalnet.com/fairs-festivals/Massachusetts/Fall-River-MA"},
  {name:"Cadette Special Agent Workshop",date:"2026-05-03",time:"1:00 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Girl Scout workshop",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Teen Game Night",date:"2026-05-07",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Mother's Day at Battleship Cove",date:"2026-05-10",time:"9:00 AM",sub:"Museum/Attraction",cost:"Paid",desc:"Special Mother's Day celebration",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Writing Group",date:"2026-05-13",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"YA Comics Club",date:"2026-05-14",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Comics and graphic novels for teens 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Homeschool Day",date:"2026-05-15",time:"9:00 AM",sub:"Museum/Attraction",cost:"$10-$15",desc:"Special homeschool day with workshops",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Citizenship in the Community – Scout Workshop",date:"2026-05-17",time:"1:00 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Spring 2026 Scouting Merit Badge Workshop – SOLD OUT",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Junior Create & Innovate and Paddle Boats",date:"2026-05-17",time:"1:00 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Girl Scout workshop",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Books & Tea Club",date:"2026-05-20",time:"2:00 PM",sub:"Library",cost:"Free",desc:"Adult book club with tea",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Memorial Day at Battleship Cove",date:"2026-05-25",time:"9:00 AM",sub:"Museum/Attraction",cost:"Paid",desc:"Memorial Day ceremony and open museum",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Photography Group",date:"2026-05-27",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Photography enthusiasts group meeting",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Battle of Fall River Reenactment Weekend",date:"2026-05-30",time:"10:00 AM",sub:"Community",cost:"Free",desc:"Historical reenactment of the Battle of Fall River",location:"Fall River Heritage State Park, 100 Davol St",url:"https://massachusetts250.org/event/battle-of-fall-river-reenactment-weekend/"},
  // June 2026
  {name:"Teen Game Night",date:"2026-06-04",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Fall River Farmers and Artisans Market",date:"2026-06-06",time:"10:00 AM",sub:"Community",cost:"Free",desc:"Local farmers and artisans market (weekly Saturdays, Jun-Oct)",location:"Cardinal Medeiros Towers, Fall River",url:"https://www.vivafallriver.com"},
  {name:"Writing Group",date:"2026-06-10",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Summer Reading Program Kickoff",date:"2026-06-15",time:"10:00 AM",sub:"Library",cost:"Free",desc:"Annual summer reading program for all ages",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Heritage State Park Summer Programs",date:"2026-06-15",time:"10:00 AM",sub:"Park/Nature",cost:"Free",desc:"Summer outdoor and history programs",location:"Fall River Heritage State Park, 100 Davol St",url:"https://www.mass.gov/locations/fall-river-heritage-state-park"},
  // July 2026
  {name:"Teen Game Night",date:"2026-07-02",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Writing Group",date:"2026-07-08",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  // August 2026
  {name:"Parish of the Good Shepherd Feast",date:"2026-08-01",time:"12:00 PM",sub:"Community",cost:"Free",desc:"Annual parish feast celebration",location:"Parish of the Good Shepherd, Fall River",url:"https://festivalnet.com/fairs-festivals/Massachusetts/Fall-River-MA"},
  {name:"August Adventures at Battleship Cove",date:"2026-08-05",time:"9:00 AM",sub:"Museum/Attraction",cost:"Free",desc:"Free admission during August Adventures",location:"Battleship Cove, 5 Water St, Fall River",url:"https://www.battleshipcove.org/events"},
  {name:"Teen Game Night",date:"2026-08-06",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Writing Group",date:"2026-08-12",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Take Me to the River Music Festival",date:"2026-08-22",time:"4:00 PM",sub:"Community",cost:"Paid",desc:"Waterfront music festival with food trucks and live music",location:"Fall River City Pier, Fall River Waterfront",url:"https://www.heraldnews.com"},
  // September 2026
  {name:"Teen Game Night",date:"2026-09-03",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Writing Group",date:"2026-09-09",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Heritage State Park Fall Programs",date:"2026-09-15",time:"10:00 AM",sub:"Park/Nature",cost:"Free",desc:"Fall nature and history programs",location:"Fall River Heritage State Park, 100 Davol St",url:"https://www.mass.gov/locations/fall-river-heritage-state-park"},
  // October 2026
  {name:"Teen Game Night",date:"2026-10-01",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Oktoberfest at Holy Name School",date:"2026-10-01",time:"12:00 PM",sub:"Community",cost:"Free",desc:"Annual Oktoberfest celebration",location:"Holy Name School, Fall River",url:"https://festivalnet.com/fairs-festivals/Massachusetts/Fall-River-MA"},
  {name:"Writing Group",date:"2026-10-14",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  // November 2026
  {name:"Diman PTO Craft Fair",date:"2026-11-01",time:"10:00 AM",sub:"Community",cost:"Free",desc:"Annual craft fair at Diman Vocational Technical High School",location:"Diman RVT High School, Fall River",url:"https://festivalnet.com/fairs-festivals/Massachusetts/Fall-River-MA"},
  {name:"Teen Game Night",date:"2026-11-05",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Writing Group",date:"2026-11-11",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Thanksmas Holiday Market",date:"2026-11-14",time:"4:00 PM",sub:"Community",cost:"Free",desc:"5th Annual Thanksmas Holiday Market",location:"Purchase Street, Fall River",url:"https://www.facebook.com/FallRiverFAM/"},
  {name:"Liberal Club Autumn Craft Fair",date:"2026-11-15",time:"10:00 AM",sub:"Community",cost:"Free",desc:"Autumn craft fair at the Liberal Club",location:"The Liberal Club, Fall River",url:"https://festivalnet.com/fairs-festivals/Massachusetts/Fall-River-MA"},
  // December 2026
  {name:"Fall River Christmas Arts and Crafts Fair",date:"2026-12-01",time:"10:00 AM",sub:"Community",cost:"Free",desc:"Annual Christmas arts and crafts fair",location:"Durfee High School, Fall River",url:"https://festivalnet.com/fairs-festivals/Massachusetts/Fall-River-MA"},
  {name:"Teen Game Night",date:"2026-12-03",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Writing Group",date:"2026-12-09",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
  {name:"Banned Book Club",date:"2026-12-24",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Book club focused on banned and challenged books",location:"Fall River Public Library, 104 North Main St",url:"https://fallriverlibrary.org/events"},
].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export const evTagMap: Record<string, [string, string]> = {
  'Library': ['purple', '📚 Library'],
  'Museum/Attraction': ['gold', '⚓ Museum'],
  'Community': ['green', '🏙 Community'],
  'Arts & Culture': ['orange', '🎨 Arts'],
  'Park/Nature': ['green', '🌿 Nature'],
};

export const evClassMap: Record<string, string> = {
  'Library': 'lib',
  'Museum/Attraction': 'museum',
  'Community': 'comm',
  'Park/Nature': 'park',
  'Arts & Culture': 'arts',
};
