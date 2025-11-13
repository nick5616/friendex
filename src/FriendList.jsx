// src/FriendList.jsx
function FriendList({ friends, selectedId, onSelect }) {
    return (
        <div className="h-48 md:h-64 flex-1 border-2 border-stone-800 p-2 card-hand-drawn overflow-y-auto">
            <ul className="space-y-2">
                {friends.map((friend) => (
                    <li key={friend.id}>
                        <button
                            onClick={() => onSelect(friend.id)}
                            className={`w-full text-left text-xl font-bold p-2 transition-colors duration-150`}
                            style={{
                                backgroundColor: selectedId === friend.id 
                                    ? 'var(--color-primary)' 
                                    : 'transparent',
                                borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
                            }}
                            onMouseEnter={(e) => {
                                if (selectedId !== friend.id) {
                                    e.target.style.backgroundColor = 'var(--color-primary-light)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedId !== friend.id) {
                                    e.target.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {friend.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FriendList;
