document.addEventListener('DOMContentLoaded', fetchUsers);

document.getElementById('submit').addEventListener('click', async function (event) {
    event.preventDefault();
    await addUser();
});

function displayMessage(message, isError) {
    const messageContainer = document.getElementById('message');
    messageContainer.innerHTML = '';
    const header = document.createElement('h1');
    header.textContent = message;
    header.style.color = isError ? 'red : 'green';
    messageContainer.appendChild(header);
}

async function addUser() {
    try {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        
        if (username == '') throw new Error('Username cannot be blank');
        if (email == '') throw new Error('Email cannot be blank');
        
        const data = { username, email };
        
        console.log('Data:', data);
        
        // Send data to server
        const response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // Get response from server
        const result = await response.json();
        console.log('Success:', result);

        // Clear input fields
        document.getElementById('username').value = '';
        document.getElementById('email').value = '';
        
        // Reload users
        await fetchUsers();

    } catch (error) {
        console.error(error.message);
        displayMessage('Error adding user:\n {error.message}', true);
        return false;
    }
    return true;
}

async function deleteUser(userId) {
    try {
        if (userId === null) throw new Error('User ID is null');
        
        const response = await fetch('/users', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'_id': userId}),
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete user');
        }
        
        await fetchUsers();
    } catch (error) {
        console.error(error.message);
        displayErrorMessage('Error deleting user:\n', error.message);
        return false;
    }
    return true;
}

async function fetchUsers() {
    try {
        // Fetch users from server
        const response = await fetch('/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const users = await response.json();
        if (users === null) throw new Error('Users is Null');
        if (users.length === 0) throw new Error('No users found');
        
        console.log('Users:', users);

        // Clear user list
        document.getElementById('user-list').innerHTML = '';
        // Add users to list
        users.forEach(user => {
            // Create list elements
            const li = document.createElement('li');
            const nameItem = document.createElement('p');
            const emailItem = document.createElement('p');
            // Set element content
            nameItem.textContent = user.username;
            emailItem.textContent = user.email;
            // Delete button
            deleteButton.textContent = 'Delete';
            deleteButton.setAttribute('data-userid', user._id);
            deleteButton.addEventListener('click', async function(event) {
                event.preventDefault();
                const userId = this.getAttribute('data-userid');
                await deleteUser(userId);
            });
            
            // Append elements to list
            li.appendChild(nameItem);
            li.appendChild(emailItem);
            li.appendChild(deleteButton);
            // Append user to user list
            document.getElementById('user-list').appendChild(li);
        });
    } catch (error) {
        console.error(error.message);
        displayErrorMessage('Error fetching users:', error.message);
        return false;
    }
    return true;
}
