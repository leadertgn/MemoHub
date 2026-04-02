export default function RoleAssigner({ user, onEdit }) {
  return (
    <button
      onClick={() => onEdit(user)}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1 hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white transition-colors whitespace-nowrap"
    >
      Modifier
    </button>
  );
}
