import { ParentConnectorReference, SubConnector } from '../util/subConnector';

/***********************************************************************************************
 *
 *                                      F I S H E Y E
 *
 ***********************************************************************************************/

/**
 * SubConnector class that provides API methods of fisheye
 *
 * Fisheye - API Documentation
 * https://docs.atlassian.com/fisheye-crucible/latest/wadl/fisheye.html
 */
export class SubConnectorFisheye extends SubConnector {
  /**
   * Creates a new sub connector
   * @param parentReference Parent connector
   */
  public constructor(parentReference: ParentConnectorReference) {
    super(parentReference);
  }

  /********************** ??? API **********************/

  // TODO: This part of the API is not completely documented - must be evaluated
}
