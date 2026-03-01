export interface CityEvent {
  name: string;
  date: string;
  time: string;
  sub: string;
  cost: string;
  desc: string;
}

export const EVENTS: CityEvent[] = [
  {name:"Historical Fiction Book Club",date:"2026-03-02",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Adult book club focused on historical fiction"},
  {name:"Preschool Storytime",date:"2026-03-03",time:"11:00 AM",sub:"Library",cost:"Free",desc:"Stories, literacy movie, craft for ages 3-5"},
  {name:"Drawing the Figure (SoCo Art Labs)",date:"2026-03-01",time:"1:00 PM",sub:"Community",cost:"Free",desc:"Figure drawing with live model, adults only"},
  {name:"Play & Learn",date:"2026-03-04",time:"10:00 AM",sub:"Library",cost:"Free",desc:"Early childhood play and learning program"},
  {name:"English Conversation Group",date:"2026-03-04",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Practice English speaking and listening skills"},
  {name:"Knitting Club",date:"2026-03-05",time:"1:00 PM",sub:"Library",cost:"Free",desc:"Knitting and crochet group, beginners welcome"},
  {name:"Teen Game Night",date:"2026-03-05",time:"5:30 PM",sub:"Library",cost:"Free",desc:"Multiplayer video games for teens ages 13-18"},
  {name:"Chess Club",date:"2026-03-07",time:"12:30 PM",sub:"Library",cost:"Free",desc:"Chess for all skill levels"},
  {name:"Cadette Comic Artist Workshop",date:"2026-03-08",time:"1:30 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Girl Scout merit badge workshop at Battleship Cove"},
  {name:"Author Talk: Lida Perry – Aging with Joy",date:"2026-03-09",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Local author discusses her book on aging gracefully"},
  {name:"The Great LEGO Leprechaun Trap Challenge",date:"2026-03-10",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Build a leprechaun trap with LEGOs, winner gets a prize"},
  {name:"Magic: The Gathering Commander Club",date:"2026-03-11",time:"6:00 PM",sub:"Library",cost:"Free",desc:"MTG Commander for teens and adults 13+"},
  {name:"Writing Group",date:"2026-03-11",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Creative writing community and feedback group"},
  {name:"YA Comics Club",date:"2026-03-12",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Comics, manga, graphic novels for teens 13-18"},
  {name:"Phelan Monsters Puppet Show",date:"2026-03-14",time:"11:00 AM",sub:"Library",cost:"Free",desc:"Children's puppet show"},
  {name:"Safety Workshop – Scout Merit Badge",date:"2026-03-15",time:"1:00 PM",sub:"Museum/Attraction",cost:"Paid",desc:"Spring 2026 Scouting Merit Badge Workshop at Battleship Cove"},
  {name:"Heritage State Park Spring Programs",date:"2026-03-15",time:"10:00 AM",sub:"Park/Nature",cost:"Free",desc:"Spring nature and history programs, free parking"},
  {name:"Creative Arts Network Events",date:"2026-03-15",time:"6:00 PM",sub:"Arts & Culture",cost:"Varies",desc:"Arts events in the Fall River Waterfront Cultural District"},
  {name:"The Great Leprechaun Hunt!",date:"2026-03-17",time:"4:00 PM",sub:"Library",cost:"Free",desc:"St. Patrick's Day leprechaun hunt for kids"},
  {name:"Books & Tea Club",date:"2026-03-18",time:"2:00 PM",sub:"Library",cost:"Free",desc:"Adult book club with tea"},
  {name:"Watercolor Workshop",date:"2026-03-18",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Adult watercolor painting workshop"},
  {name:"Homeschool Day at Battleship Cove",date:"2026-03-20",time:"9:00 AM",sub:"Museum/Attraction",cost:"$10-$15",desc:"Special homeschool day with workshops at Battleship Cove"},
  {name:"Read Across America Night",date:"2026-03-24",time:"6:00 PM",sub:"Library",cost:"Free",desc:"Celebration of reading and literacy"},
  {name:"Voices Unheard Concert",date:"2026-03-26",time:"8:00 PM",sub:"Library",cost:"Free",desc:"Concert featuring underrepresented voices"},
  {name:"City Council Public Meeting",date:"2026-03-28",time:"5:55 PM",sub:"Community",cost:"Free",desc:"City Council public hearing on Capital Improvement Plan"},
  {name:"Easter Scavenger Hunt",date:"2026-04-04",time:"9:00 AM",sub:"Museum/Attraction",cost:"Paid",desc:"Find 12 Easter eggs throughout the ships to win a prize"},
  {name:"Muckraker-palooza 2026",date:"2026-04-19",time:"3:00 PM",sub:"Community",cost:"Paid",desc:"Annual community festival and music event"},
  {name:"Little Theatre – Spring Production",date:"2026-04-25",time:"7:30 PM",sub:"Arts & Culture",cost:"Paid",desc:"Live theater production by Little Theatre of Fall River"},
  {name:"Spring Craft, Vendor Fair & Food Trucks",date:"2026-05-01",time:"10:00 AM",sub:"Community",cost:"Free",desc:"Spring craft fair with vendors and food trucks"},
  {name:"Battle of Fall River Reenactment Weekend",date:"2026-05-30",time:"10:00 AM",sub:"Community",cost:"Free",desc:"Historical reenactment of the Battle of Fall River"},
  {name:"Summer Reading Program Kickoff",date:"2026-06-15",time:"10:00 AM",sub:"Library",cost:"Free",desc:"Annual summer reading program for all ages"},
  {name:"Take Me to the River Music Festival",date:"2026-08-22",time:"4:00 PM",sub:"Community",cost:"Paid",desc:"Waterfront music festival with food trucks and live music"},
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
