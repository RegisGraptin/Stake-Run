import asyncio
import random
from datetime import date, timedelta
from bot import FitnessUser, show_leaderboard

# Copy the create_mock_users function here
def create_mock_users(num_users: int):
    for i in range(num_users):
        user = FitnessUser(
            telegram_id=1000000 + i,
            username=f"user_{i}",
            total_kilometers=random.uniform(0, 100),
            valid_days=random.randint(0, 30),
            rest_days=random.randint(0, 4),
            join_date=date.today() - timedelta(days=random.randint(0, 30))
        )
        user.save_user()

# Copy the test_leaderboard function here
async def test_leaderboard():
    class MockUpdate:
        effective_chat = type('obj', (object,), {'id': 'test_chat_id'})()

    class MockContext:
        bot = type('obj', (object,), {'send_message': print})()

    await show_leaderboard(MockUpdate(), MockContext())

# Main test execution
if __name__ == '__main__':
    # Create mock users
    create_mock_users(15)

    # Run the leaderboard test
    asyncio.run(test_leaderboard())
