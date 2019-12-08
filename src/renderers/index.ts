for (const item of document.getElementsByTagName('a')) {
    item.onclick = (event) => {
        event.preventDefault();
        alert('TODO!');
    };
}