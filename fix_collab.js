import * as fs from 'fs';

const path = 'src/pages/CollaborationRooms.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('const [activeRoom, setActiveRoom] = useState(MOCK_ROOMS[0]);', 'const [activeRoom, setActiveRoom] = useState(MOCK_ROOMS[0] || null);');
content = content.replace('export default function CollaborationRooms() {', `export default function CollaborationRooms() {`);

// Add defensive checks:
content = content.replace('className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"', 
`className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {!activeRoom ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">No rooms available. Create one to get started!</div>
        ) : (
          <>
`);

// The issue with the above approach is we need to wrap the whole inner block.
// It's safer to just replace 'activeRoom.' with 'activeRoom?.' if possible, but that breaks when activeRoom is null.
