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
    return fetch(`http://localhost:5572/${method}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }).then((res) => res.json());
  }
}

export default RcloneRc;
