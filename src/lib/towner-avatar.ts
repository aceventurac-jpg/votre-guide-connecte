import human from '@/assets/towner-human-short.png';
import braids from '@/assets/towner-human-braids.png';
import feline from '@/assets/towner-feline.png';
import robot from '@/assets/towner-robot.png';
export const TOWNER_FORMS = [
  { id: 'human', name: 'Humain · coupe courte', image: human },
  { id: 'braids', name: 'Humain · tresses', image: braids },
  { id: 'feline', name: 'Félin', image: feline },
  { id: 'robot', name: 'Robot', image: robot },
] as const;
export function townerImage(form?: string) { return (TOWNER_FORMS.find(f => f.id === form) ?? TOWNER_FORMS[0]).image; }