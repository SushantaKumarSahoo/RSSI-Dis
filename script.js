document.getElementById('scanButton').addEventListener('click', async () => {
    const deviceList = document.getElementById('deviceList');
    deviceList.innerHTML = ''; // Clear the list before starting a new scan

    try {
      const options = {
        acceptAllDevices: true,
        optionalServices: ['generic_access']
      };

      const device = await navigator.bluetooth.requestDevice(options);
      
      const listItem = document.createElement('li');
      listItem.innerHTML = `<span class="device-info">Name: ${device.name}, ID: ${device.id}</span>`;
      
      const connectButton = document.createElement('button');
      connectButton.textContent = 'Connect';
      connectButton.className = 'connect-button';
      connectButton.addEventListener('click', async () => {
        try {
          const server = await device.gatt.connect();
          const service = await server.getPrimaryService('generic_access');
          const rssi = await device.gatt.getPrimaryService('generic_access')
                          .then(service => service.getCharacteristic('gap.device_name'))
                          .then(characteristic => characteristic.readValue())
                          .then(value => new TextDecoder().decode(value));
          
          listItem.innerHTML += `<span class="device-info">, RSSI: ${rssi} dBm, Estimated Distance: ${calculateDistance(rssi)} meters</span>`;
        } catch (error) {
          console.error('Failed to connect or retrieve data', error);
        }
      });

      listItem.appendChild(connectButton);
      deviceList.appendChild(listItem);
    } catch (error) {
      console.error('Failed to scan for devices', error);
    }
  });

  function calculateDistance(rssi) {
    const txPower = -59; // Assumed TX power level in dBm at 1 meter distance
    if (rssi == 0) {
      return -1.0;
    }
    const ratio = rssi * 1.0 / txPower;
    if (ratio < 1.0) {
      return Math.pow(ratio, 10).toFixed(2);
    } else {
      const distance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
      return distance.toFixed(2);
    }
  }
