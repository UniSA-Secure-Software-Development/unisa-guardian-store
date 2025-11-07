/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  Sequelize
} from 'sequelize'

class BasketItem extends Model<
InferAttributes<BasketItem>,
InferCreationAttributes<BasketItem>
> {
  declare ProductId: number
  declare BasketId: number
  declare id: CreationOptional<number>
  declare quantity: number
}

const BasketItemModelInit = (sequelize: Sequelize) => {
  BasketItem.init(
    {
      ProductId: {
        type: DataTypes.INTEGER
      },
      BasketId: {
        type: DataTypes.INTEGER
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: 'Quantity must be an integer'
          },
          min: {
            args: [1],
            msg: 'Quantity must be at least 1'
          }
        }
      }
    },
    {
      tableName: 'BasketItems',
      sequelize
    }
  )
}

export { BasketItem as BasketItemModel, BasketItemModelInit }
