import GalleryDriver from '../../drivers/pptrDriver';
import {toMatchImageSnapshot} from '../../drivers/matchers';
import GALLERY_CONSTS from '../../../src/common/constants';

jest.setTimeout(30000)

expect.extend({ toMatchImageSnapshot });

describe('bricks - e2e', () => {
  let driver;
  
  beforeEach(async () => {
    driver = new GalleryDriver();
    await driver.launchBrowser();
  });

  afterEach(() => {
    driver.closeBrowser();
  });
  it('bricks - scrollDirection = vertical', async () => {
    await driver.openPage({
      galleryLayout: GALLERY_CONSTS.layout.BRICKS,
      scrollDirection: GALLERY_CONSTS.scrollDirection.VERTICAL
    });
    await driver.waitFor.hookToBeVisible('item-container');
    await driver.waitFor.timer(200);
    const page = await driver.grab.screenshot();
    expect(page).toMatchImageSnapshot();
  });
  it('bricks layout - scrollDirection = horizontal', async () => {
    await driver.openPage({
      galleryLayout: GALLERY_CONSTS.layout.BRICKS,
      scrollDirection: GALLERY_CONSTS.scrollDirection.HORIZONTAL
    });
    await driver.waitFor.hookToBeVisible('item-container');
    await driver.waitFor.timer(200);
    const page = await driver.grab.screenshot();
    expect(page).toMatchImageSnapshot();
  });
  
})