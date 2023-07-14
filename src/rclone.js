class RcloneRc {
  /**
   *
   * @param {string} username
   * @param {string} password
   */
  constructor(username, password) {
    this.auth = "Basic " + btoa(username + ":" + password);
  }

  /**
   *
   * @param {string} method
   * @param {any} params
   * @returns {Promise<any>}
   */
  call(method, params) {
    const options = {
      method: "POST",
      headers: {
        Authorization: this.auth,
      },
    };
    if (params) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(params);
    }
    return fetch(`http://127.0.0.1:5572/${method}`, options).then((res) =>
      res.json()
    );
  }
}

export default RcloneRc;
