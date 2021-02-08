/**
 *
 * A class allowing the consumption of the API using pagination like functionality
 *
 * */

const DEFAULT_API_ENDPOINT =
  "https://bumble-twitter-interview.herokuapp.com/shay-murnin";
const DEFAULT_PAGE_SIZE = 10;
/**
 *
 * Let's allow failed fetch requests to retry a maximum of 10 times at specified delays before throwing an Error
 *
 */
const DEFAULT_FETCH_RETRIES = 10;
const RETRY_WAIT_DURATION = 500;
const DATABASE_RESET_ID = 10001;

type BuzzDetails = {
  id: number;
  image: string;
  username: string;
  text: string;
  timeStamp: number;
};

class TimelinePagination {
  private currentTimestampCursor: number = new Date().getTime();
  private apiEndpoint: string = DEFAULT_API_ENDPOINT;
  private static instance: TimelinePagination;
  private fetchRetriesRemaining = DEFAULT_FETCH_RETRIES;

  constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new TimelinePagination();
    return this.instance;
  }

  private async fetchWithRetry(url: string) {
    const wait = (delay: number) => {
      return new Promise((resolve) => setTimeout(resolve, delay));
    };
    const onError = (err: Error) => {
      this.fetchRetriesRemaining = this.fetchRetriesRemaining -= 1;
      if (this.fetchRetriesRemaining === 0) {
        throw err;
      }
      return wait(RETRY_WAIT_DURATION).then(() => this.fetchWithRetry(url));
    };

    return fetch(url)
      .then((response) => response.json())
      .then(async (data: BuzzDetails[] = []) => {
        /**
         *
         * Let's reset fetch retries and set current timestamp cursor to the top (most recent) item in the data array
         *
         */
        this.fetchRetriesRemaining = DEFAULT_FETCH_RETRIES;

        if (data.length > 0) {
          this.setCurrentTimestampCursor(data[0].timeStamp);
          if (data[0].id === DATABASE_RESET_ID) {
            await this.resetDatabase();
          }
        }

        return data;
      })
      .catch(onError);
  }

  async first() {
    /**
     *
     * Let's grab a the default page size of Buzzes before the last timestamp cursor — initilized as Date.now()
     *
     *  */
    return this.fetchWithRetry(
      `${this.apiEndpoint}/api/?count=${DEFAULT_PAGE_SIZE}&beforeTime=${this.currentTimestampCursor}`
    );
  }

  async next() {
    /**
     *
     * Let's grab a random number (1-20) of Buzzes since the last timestamp cursor
     *
     *  */
    return this.fetchWithRetry(
      `${this.apiEndpoint}/api/?count=${
        Math.floor(Math.random() * DEFAULT_PAGE_SIZE) + 1
      }&afterTime=${this.currentTimestampCursor}`
    );
  }

  resetDatabase() {
    return this.fetchWithRetry(`${this.apiEndpoint}/reset`);
  }

  setCurrentTimestampCursor(lastBuzzTimestamp: number) {
    this.currentTimestampCursor = lastBuzzTimestamp;
  }
}

export { TimelinePagination };
