function startSocketIOConnection() {
    const socket = io.connect('http://104.155.233.176:3000/');

    socket.on('connect', () => {
        console.log(socket.id);
    });
    socket.on('imageSend', (image) => {
        // console.log(image);
        //var strImg = String.fromCharCode.apply(null, new Uint8Array(image));
        //test
        var strImg = '';
        var bytes = new Uint8Array(image);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            strImg += String.fromCharCode(bytes[i]);
        }
        const img = document.getElementById('image');
        img.src = `data:image/jpeg;base64,${strImg}`;
    })
}