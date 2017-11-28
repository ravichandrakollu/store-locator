Store Locator
=======

Store Locator helps the users to display the markers of the stores(for a particular company or business) on the google map when the user specifies the latitude and longitude of the store location.

## Todo
-Add option for displaying the map or not. The user should able to display the map in mobile as well if needs.
## Issues
## Wordpress example

```php
<?php if ($locations = get_field('locations')): ?>
	<section class="locator">
		<div class="container">
			<div class="row">
				<?php $idx = 0; foreach ($locations as $location): ?>
					<div
						data-position="<?php echo $location['lat']; ?>, <?php echo $location['lng']; ?>">
							<?php echo $location['description']; ?>
						</div>
					<?php if ($idx % 4 == 0): ?>
						</div>
						<div class="row">
					<?php endif; ?>
				<?php endforeach; ?>
			</div>
		</div>
	</section>
<?php endif; ?>
```